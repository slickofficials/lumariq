package com.lumariq.android

import com.lumariq.android.net.BackendBaseUrl
import java.net.HttpURLConnection
import java.net.URL

/**
 * Android-side HTTP client (simple + deterministic).
 * Uses BackendBaseUrl.current() so emulator/device/prod can swap cleanly.
 */
object NetworkClient {

    fun getRoot(): String = httpGet("${BackendBaseUrl.current()}/")
    fun getHealth(): String = httpGet("${BackendBaseUrl.current()}/health")

    /**
     * Placeholder "prepare" until backend exposes real /transfer/prepare.
     * Keeps TransferScreen type-correct.
     */
    fun prepareTransfer(to: String, amount: Double, ccy: String): PrepareTransferResp {
        val health = getHealth()
        val healthy = health.contains("HEALTH", ignoreCase = true)
        return PrepareTransferResp(
            ok = healthy,
            intentId = if (healthy) "local-" + System.currentTimeMillis() else "",
            challenge = if (healthy) "challenge-" + System.currentTimeMillis() else "",
            expiresAt = "",
            message = if (healthy) "PREPARED" else "Backend not healthy: $health"
        )
    }

    private fun httpGet(url: String): String {
        val conn = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 4000
            readTimeout = 4000
        }
        return try {
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val body = stream?.bufferedReader()?.readText().orEmpty()
            if (body.isNotBlank()) body else "HTTP $code"
        } finally {
            conn.disconnect()
        }
    }
}
