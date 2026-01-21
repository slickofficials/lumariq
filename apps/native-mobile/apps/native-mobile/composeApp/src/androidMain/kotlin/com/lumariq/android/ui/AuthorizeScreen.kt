package com.lumariq.android.ui

import android.app.Activity
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ConfirmTransferReq
import com.lumariq.android.NetworkClient
import com.lumariq.android.SensorySystem
import kotlinx.coroutines.launch
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.time.Instant

private const val KEY_ALIAS = "lumariq_transfer_signing_key"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthorizeScreen(nav: NavController, sensory: SensorySystem) {
    val ctx = LocalContext.current
    val activity = (ctx as Activity)
    val scope = rememberCoroutineScope()

    val prev = nav.previousBackStackEntry
    val h = prev?.savedStateHandle

    val recipient = h?.get<String>("pending_recipient")?.trim().orEmpty()
    val amount = h?.get<Double>("pending_amount") ?: 0.0
    val currency = h?.get<String>("pending_currency") ?: "USD"
    val intentId = h?.get<String>("pending_intentId").orEmpty()
    val challenge = h?.get<String>("pending_challenge").orEmpty()
    val expiresAt = h?.get<String>("pending_expiresAt").orEmpty()

    var busy by remember { mutableStateOf(false) }
    var info by remember { mutableStateOf("") }
    var err by remember { mutableStateOf("") }

    fun canAuth(): Boolean =
        recipient.isNotBlank() && amount > 0.0 && intentId.isNotBlank() && challenge.isNotBlank() && expiresAt.isNotBlank()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AUTHORIZE TRANSFER", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black, titleContentColor = Color(0xFF00FF66))
            )
        },
        containerColor = Color.Black
    ) { pad ->
        Column(
            Modifier
                .padding(pad)
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Recipient: $recipient", color = Color.White)
            Text("Amount: $amount $currency", color = Color.White)
            Text("Intent: ${intentId.take(8)}…", color = Color.White)
            Text("Expires: $expiresAt", color = Color.Gray)

            if (info.isNotBlank()) Text(info, color = Color(0xFF00FF66))
            if (err.isNotBlank()) Text(err, color = Color(0xFFFF4444))

            Button(
                onClick = {
                    if (!canAuth()) {
                        err = "Missing transfer intent data. Go back and prepare again."
                        return@Button
                    }
                    busy = true
                    err = ""
                    info = "Signing…"
                    scope.launch {
                        try {
                            val kp = getOrCreateKeyPair()
                            val expMs = Instant.parse(expiresAt).toEpochMilli().toString()

                            val payload = signedPayloadBytes(
                                intentId = intentId,
                                recipient = recipient,
                                amount = amount,
                                currency = currency,
                                challenge = challenge,
                                expiresAtEpochMs = expMs
                            )

                            val sig = Signature.getInstance("SHA256withECDSA")
                            sig.initSign(kp.private)
                            sig.update(payload)
                            val signatureBytes = sig.sign()

                            val pubB64 = Base64.encodeToString(kp.public.encoded, Base64.NO_WRAP)
                            val sigB64 = Base64.encodeToString(signatureBytes, Base64.NO_WRAP)

                            info = "Confirming…"
                            val resp = NetworkClient.confirmTransfer(
                                ConfirmTransferReq(
                                    intentId = intentId,
                                    publicKeyB64 = pubB64,
                                    signatureB64 = sigB64
                                )
                            )

                            val ok = resp.status.uppercase() == "CONFIRMED"
                            if (ok) {
                                info = "✅ CONFIRMED: ${resp.txId}"
                                // optional: go receipt screen if you want
                                // nav.navigate("receipt")
                            } else {
                                err = "Confirm failed: ${resp.status} ${resp.message}"
                            }
                        } catch (e: Exception) {
                            err = "Auth error: ${e.message ?: "Unknown"}"
                        } finally {
                            busy = false
                        }
                    }
                },
                enabled = !busy,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (busy) "WORKING…" else "AUTHORIZE", fontWeight = FontWeight.Black)
            }

            OutlinedButton(
                onClick = { nav.popBackStack() },
                modifier = Modifier.fillMaxWidth()
            ) { Text("BACK") }
        }
    }
}

private fun getOrCreateKeyPair(): KeyPair {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    if (ks.containsAlias(KEY_ALIAS)) {
        val entry = ks.getEntry(KEY_ALIAS, null) as KeyStore.PrivateKeyEntry
        val pub = entry.certificate.publicKey
        return KeyPair(pub, entry.privateKey)
    }

    val kpg = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore")
    val spec = KeyGenParameterSpec.Builder(
        KEY_ALIAS,
        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
    )
        .setDigests(KeyProperties.DIGEST_SHA256)
        .setUserAuthenticationRequired(false)
        .build()

    kpg.initialize(spec)
    return kpg.generateKeyPair()
}

private fun signedPayloadBytes(
    intentId: String,
    recipient: String,
    amount: Double,
    currency: String,
    challenge: String,
    expiresAtEpochMs: String
): ByteArray {
    val s = listOf(
        intentId,
        recipient,
        amount.toString(),
        currency,
        challenge,
        expiresAtEpochMs
    ).joinToString("|")
    return s.toByteArray(Charsets.UTF_8)
}
