package com.lumariq.server

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class TransactionRequest(val recipient: String, val amount: Double)

@Serializable
data class TransactionResponse(val status: String, val txId: String, val message: String)

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json(Json { prettyPrint = true; isLenient = true })
    }

    routing {
        get("/") {
            call.respondText("LUMARIQ CENTRAL BANK: ONLINE")
        }
        
        get("/status") {
            call.respond(mapOf("status" to "OPERATIONAL", "tier" to "GOVERNOR"))
        }

        // 💸 THE TRANSACTION ENDPOINT
        post("/transfer") {
            try {
                val req = call.receive<TransactionRequest>()
                println("⚡ TRANSFER ORDER: $${req.amount} -> ${req.recipient}")
                
                // Simulate processing delay
                kotlinx.coroutines.delay(500)
                
                val txId = "TX-" + java.util.UUID.randomUUID().toString().take(8).uppercase()
                call.respond(TransactionResponse("SUCCESS", txId, "FUNDS DISPATCHED"))
            } catch (e: Exception) {
                call.respond(TransactionResponse("FAILED", "NULL", e.localizedMessage ?: "Unknown Error"))
            }
        }
    }
}
