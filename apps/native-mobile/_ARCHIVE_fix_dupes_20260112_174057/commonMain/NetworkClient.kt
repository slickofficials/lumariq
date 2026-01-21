package com.lumariq.android

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.httptimeout.*
import io.ktor.client.request.*
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class TransferReq(val recipient: String, val amount: Double)

@Serializable
data class TransferResp(val status: String, val txId: String, val message: String)

object NetworkClient {
    // For Android emulator + adb reverse: 127.0.0.1 points to host forwarded port
    private const val BASE_URL = "http://127.0.0.1:8080"

    private val client = HttpClient(OkHttp) {
        expectSuccess = false
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true; isLenient = true })
        }
        install(HttpTimeout) { requestTimeoutMillis = 7000 }
    }

    suspend fun check(): String = try {
        client.get("$BASE_URL/").body<String>()
    } catch (e: Exception) {
        "OFFLINE"
    }

    suspend fun getTransactions(): List<TransactionDto> {
        return client.get("$BASE_URL/v1/transactions").body()
    }

    suspend fun executeTransfer(recipient: String, amount: Double): TransferResp {
        return try {
            client.post("$BASE_URL/transfer") {
                contentType(ContentType.Application.Json)
                setBody(TransferReq(recipient, amount))
            }.body()
        } catch (e: Exception) {
            TransferResp("ERROR", "000", e.message ?: "Network Error")
        }
    }
}
