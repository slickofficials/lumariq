package com.lumariq.android

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object NetworkClient {
    // ✅ Emulator can use 10.0.2.2 (host loopback)
    // ✅ If you adb reverse tcp:8080 -> tcp:8080, emulator can also use 127.0.0.1
    private const val BASE_URL = "http://10.0.2.2:8080"

    private val client = HttpClient(OkHttp) {
        expectSuccess = false
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true; isLenient = true })
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 7_000
            connectTimeoutMillis = 7_000
            socketTimeoutMillis  = 7_000
        }
    }

    suspend fun status(): String =
        client.get("$BASE_URL/status").body<String>()

    suspend fun getTransactions(): List<TransactionDto> =
        client.get("$BASE_URL/v1/transactions").body()

    // Legacy simple transfer (kept)
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

    // ✅ Production auth flow
    suspend fun prepareTransfer(req: PrepareTransferReq): PrepareTransferResp =
        client.post("$BASE_URL/v1/transfers/prepare") {
            contentType(ContentType.Application.Json)
            setBody(req)
        }.body()

    suspend fun confirmTransfer(req: ConfirmTransferReq): ConfirmTransferResp =
        client.post("$BASE_URL/v1/transfers/confirm") {
            contentType(ContentType.Application.Json)
            setBody(req)
        }.body()
}
