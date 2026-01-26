package com.lumariq.server

import com.lumariq.server.db.FunctionRegistryRepository
import com.lumariq.server.db.InvocationRepository
import com.lumariq.server.routes.adminFunctionRoutes
import com.lumariq.server.routes.functionRoutes
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.application.call
import io.ktor.server.plugins.callid.CallId
import io.ktor.server.plugins.callid.callId
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.compression.Compression
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.defaultheaders.DefaultHeaders
import io.ktor.server.plugins.hsts.HSTS
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.flywaydb.core.Flyway
import org.slf4j.event.Level
import io.micrometer.prometheus.PrometheusConfig
import io.micrometer.prometheus.PrometheusMeterRegistry
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.atomic.AtomicReference

private fun env(name: String): String? = System.getenv(name)

private fun buildDataSource(): HikariDataSource {
    val jdbcUrl = env("DB_URL") ?: "jdbc:postgresql://localhost:5432/dispatch"
    val user = env("DB_USER") ?: "lumariq"
    val pass = env("DB_PASSWORD") ?: "lumariq_dev_pw"

    val cfg = HikariConfig().apply {
        this.jdbcUrl = jdbcUrl
        this.username = user
        this.password = pass
        maximumPoolSize = env("DB_POOL_SIZE")?.toIntOrNull() ?: 10
        connectionTimeout = env("DB_CONN_TIMEOUT_MS")?.toLongOrNull() ?: 10_000L
        idleTimeout = env("DB_IDLE_TIMEOUT_MS")?.toLongOrNull() ?: 600_000L
        maxLifetime = env("DB_MAX_LIFETIME_MS")?.toLongOrNull() ?: 1_800_000L
        isAutoCommit = true
        validationTimeout = 5_000L
    }

    return HikariDataSource(cfg)
}

@Serializable
private data class ApiError(
    val error: String,
    val message: String? = null,
    val requestId: String? = null
)

@Serializable
private data class MetricsLite(
    val uptime_seconds: Long,
    val requests_total: Long,
    val last_error: String? = null
)

fun Application.module() {
    val startedAtMs = System.currentTimeMillis()
    val lastError = AtomicReference<String?>(null)
    val requestsTotal = AtomicLong(0)

    // Prometheus registry for /metrics + Micrometer plugin
    val prometheusRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)

    val ds = buildDataSource()

    Flyway.configure()
        .dataSource(ds)
        .locations("classpath:db/migration")
        .load()
        .migrate()

    val funcRepo = FunctionRegistryRepository(ds)
    val invRepo = InvocationRepository(ds)

    install(CallId) {
        header(HttpHeaders.XRequestId)
        generate { UUID.randomUUID().toString() }
        verify { it.isNotBlank() && it.length <= 128 }
    }

    install(CallLogging) {
        level = Level.INFO
        format { call ->
            val rid = call.callId ?: "-"
            val method = call.request.httpMethod.value
            val path = call.request.path()
            val status = call.response.status()?.value ?: 0
            "rid=$rid $method $path -> $status"
        }
    }

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            val rid = call.callId
            lastError.set("${cause::class.simpleName}: ${cause.message}")
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiError(error = "internal_error", message = cause.message, requestId = rid)
            )
        }
        status(HttpStatusCode.NotFound) { call, _ ->
            call.respond(HttpStatusCode.NotFound, ApiError("not_found", requestId = call.callId))
        }
    }

    install(DefaultHeaders) {
        header("X-Content-Type-Options", "nosniff")
        header("X-Frame-Options", "DENY")
        header("Referrer-Policy", "no-referrer")
        header("X-XSS-Protection", "0")
    }

    install(HSTS) {
        maxAgeInSeconds = 365L * 24L * 60L * 60L
        includeSubDomains = true
        preload = true
    }

    install(Compression)

    install(CORS) {
        anyHost()
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.XRequestId)
        exposeHeader(HttpHeaders.XRequestId)
        allowCredentials = false
    }

    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = false
                isLenient = true
                ignoreUnknownKeys = true
            }
        )
    }

    // ✅ IMPORTANT: Application-level plugin install (NOT inside routing {})
    install(MicrometerMetrics) {
        registry = prometheusRegistry
    }

    routing {
        // Prometheus scrape endpoint
        get("/metrics") {
            call.respondText(
                text = prometheusRegistry.scrape(),
                contentType = ContentType.parse("text/plain; version=0.0.4")
            )
        }

        get("/health") {
            requestsTotal.incrementAndGet()
            call.respond(mapOf("ok" to true))
        }

        get("/ready") {
            requestsTotal.incrementAndGet()
            try {
                ds.connection.use { c -> c.createStatement().use { st -> st.execute("SELECT 1") } }
                call.respond(mapOf("ready" to true))
            } catch (t: Throwable) {
                lastError.set("${t::class.simpleName}: ${t.message}")
                call.respond(
                    HttpStatusCode.ServiceUnavailable,
                    mapOf("ready" to false, "error" to (t.message ?: "db not ready"))
                )
            }
        }

        get("/metrics-lite") {
            requestsTotal.incrementAndGet()
            val upSeconds = (System.currentTimeMillis() - startedAtMs) / 1000
            call.respond(
                MetricsLite(
                    uptime_seconds = upSeconds,
                    requests_total = requestsTotal.get(),
                    last_error = lastError.get()
                )
            )
        }

        functionRoutes(funcRepo, invRepo)
        adminFunctionRoutes(funcRepo)
    }
}

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}
