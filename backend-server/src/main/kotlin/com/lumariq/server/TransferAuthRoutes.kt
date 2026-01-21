package com.lumariq.server

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import java.security.KeyFactory
import java.security.PublicKey
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.time.Instant
import java.util.Base64
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.math.BigDecimal

private fun canonicalAmount(amount: Double): String =
  BigDecimal.valueOf(amount).stripTrailingZeros().toPlainString()

@Serializable data class PrepareTransferReq(val recipient: String, val amount: Double, val currency: String = "USD")
@Serializable data class PrepareTransferResp(val intentId: String, val challenge: String, val expiresAt: String)

@Serializable data class ConfirmTransferReq(val intentId: String, val publicKeyB64: String, val signatureB64: String)
@Serializable data class ConfirmTransferResp(val status: String, val txId: String, val message: String = "")

private data class IntentRec(
  val intentId: String,
  val recipient: String,
  val amount: Double,
  val currency: String,
  val challenge: String,
  val expiresAtEpochMs: Long,
  @Volatile var used: Boolean = false
)

private val intents = ConcurrentHashMap<String, IntentRec>()

private fun nowMs() = System.currentTimeMillis()

private fun b64(bytes: ByteArray) = Base64.getEncoder().encodeToString(bytes)
private fun b64dec(s: String) = Base64.getDecoder().decode(s)

private fun parsePubKey(b64key: String): PublicKey {
  val spec = X509EncodedKeySpec(b64dec(b64key))
  val kf = KeyFactory.getInstance("EC")
  return kf.generatePublic(spec)
}

private fun verifyEcdsaSha256(pub: PublicKey, payload: ByteArray, sigB64: String): Boolean {
  val sig = Signature.getInstance("SHA256withECDSA")
  sig.initVerify(pub)
  sig.update(payload)
  return sig.verify(b64dec(sigB64))
}

private fun signedPayload(i: IntentRec): ByteArray {
  // Bind *everything* important into what gets signed:
  // intentId|recipient|amount|currency|challenge|expiresAtMs
  val s = listOf(
    i.intentId,
    i.recipient,
    canonicalAmount(i.amount),
    i.currency,
    i.challenge,
    i.expiresAtEpochMs.toString()
  ).joinToString("|")
  return s.toByteArray(Charsets.UTF_8)
}

fun Route.transferAuthRoutes() {

  route("/v1/transfers") {

    post("/prepare") {
      val req = call.receive<PrepareTransferReq>()
      val recipient = req.recipient.trim()
      val amount = req.amount

      if (recipient.isBlank() || amount <= 0.0) {
        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid recipient/amount"))
        return@post
      }

      val intentId = UUID.randomUUID().toString()
      val challenge = b64(UUID.randomUUID().toString().toByteArray(Charsets.UTF_8))
      val expiresAtMs = nowMs() + 2 * 60 * 1000L // 2 minutes

      val rec = IntentRec(
        intentId = intentId,
        recipient = recipient,
        amount = amount,
        currency = req.currency.ifBlank { "USD" },
        challenge = challenge,
        expiresAtEpochMs = expiresAtMs
      )
      intents[intentId] = rec

      call.respond(
        PrepareTransferResp(
          intentId = intentId,
          challenge = challenge,
          expiresAt = Instant.ofEpochMilli(expiresAtMs).toString()
        )
      )
    }

    post("/confirm") {
      val req = call.receive<ConfirmTransferReq>()
      val rec = intents[req.intentId]
      if (rec == null) {
        call.respond(HttpStatusCode.NotFound, ConfirmTransferResp("ERROR", "000", "Unknown intent"))
        return@post
      }

      if (rec.used) {
        // Idempotent confirm: return same txId if you persist; for now say already used
        call.respond(HttpStatusCode.Conflict, ConfirmTransferResp("ERROR", "000", "Intent already used"))
        return@post
      }

      if (nowMs() > rec.expiresAtEpochMs) {
        intents.remove(req.intentId)
        call.respond(HttpStatusCode.Gone, ConfirmTransferResp("ERROR", "000", "Intent expired"))
        return@post
      }

      val pub = try { parsePubKey(req.publicKeyB64) } catch (e: Exception) {
        call.respond(HttpStatusCode.BadRequest, ConfirmTransferResp("ERROR", "000", "Bad public key"))
        return@post
      }

      val ok = try { verifyEcdsaSha256(pub, signedPayload(rec), req.signatureB64) } catch (e: Exception) { false }
      if (!ok) {
        call.respond(HttpStatusCode.Unauthorized, ConfirmTransferResp("ERROR", "000", "Signature invalid"))
        return@post
      }

      // âœ… Authorized: mark used, create txId.
      rec.used = true
      val txId = "TX-" + UUID.randomUUID().toString().take(8).uppercase()

      // TODO: Here is where you write ledger + store tx persistent (DB/event log).
      call.respond(ConfirmTransferResp("CONFIRMED", txId, "Funds dispatched"))
    }
  }
}

