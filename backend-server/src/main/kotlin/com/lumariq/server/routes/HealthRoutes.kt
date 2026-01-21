package com.lumariq.server.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import javax.sql.DataSource

fun Application.healthRoutes(ds: DataSource) {
    routing {
        get("/health") { call.respondText("ok", ContentType.Text.Plain) }
        get("/ready") {
            try {
                ds.connection.use { c ->
                    c.createStatement().use { st -> st.execute("SELECT 1") }
                }
                call.respondText("ready", ContentType.Text.Plain)
            } catch (t: Throwable) {
                call.respondText("not_ready", ContentType.Text.Plain, status = HttpStatusCode.ServiceUnavailable)
            }
        }
    }
}
