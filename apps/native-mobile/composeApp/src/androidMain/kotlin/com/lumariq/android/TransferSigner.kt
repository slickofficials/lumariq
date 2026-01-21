package com.lumariq.android

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.util.Base64

object TransferSigner {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val ALIAS = "lumariq_transfer_key_v1"

    private fun getOrCreateKeyPair(): KeyPair {
        val ks = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        val existing = ks.getKey(ALIAS, null)
        if (existing != null) {
            val cert = ks.getCertificate(ALIAS)
            return KeyPair(cert.publicKey, existing as java.security.PrivateKey)
        }

        val kpg = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, ANDROID_KEYSTORE)
        val spec = KeyGenParameterSpec.Builder(
            ALIAS,
            KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
        )
            .setDigests(KeyProperties.DIGEST_SHA256)
            // Later: require biometrics/lockscreen here for real prod security.
            .build()

        kpg.initialize(spec)
        return kpg.generateKeyPair()
    }

    data class Signed(val publicKeyB64: String, val signatureB64: String)

    fun sign(payload: ByteArray): Signed {
        val kp = getOrCreateKeyPair()
        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initSign(kp.private)
        sig.update(payload)
        val signature = sig.sign()

        val pubB64 = Base64.getEncoder().encodeToString(kp.public.encoded) // X.509
        val sigB64 = Base64.getEncoder().encodeToString(signature)
        return Signed(pubB64, sigB64)
    }
}

