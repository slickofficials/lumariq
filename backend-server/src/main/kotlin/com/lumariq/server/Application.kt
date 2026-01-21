package com.lumariq.server

import com.lumariq.server.db.DatabaseBootstrap
import com.lumariq.server.db.NoteRepository
import com.lumariq.server.plugins.configureCors
import com.lumariq.server.routes.healthRoutes
import com.lumariq.server.routes.noteRoutes
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import javax.sql.DataSource

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
    embeddedServer(
        Netty,
        host = "127.0.0.1",
        port = port,
        module = Application::appModule
    ).start(wait = true)
}

fun Application.appModule() {
    install(ContentNegotiation) { json() }
    configureCors()

    val ds = DatabaseBootstrap.init()
    val noteRepo = NoteRepository(ds)

    healthRoutes(ds)

    routing {
noteRoutes(noteRepo)
        // if you have transfer auth routes file, keep it wired:
        transferAuthRoutes()
    }
}
