package com.lumariq.android

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.math.BigDecimal
import java.security.*

object KeystoreSigner {
  private const val STORE = "AndroidKeyStore"
  private const val ALIAS = "lumariq_transfer_key_v1"

  private fun keyPair(): KeyPair {
    val ks = KeyStore.getInstance(STORE).apply { load(null) }
    val priv = ks.getKey(ALIAS, null)
    if (priv != null) {
      val cert = ks.getCertificate(ALIAS)
      return KeyPair(cert.publicKey, priv as PrivateKey)
    }
    val gen = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, STORE)
    gen.initialize(
      KeyGenParameterSpec.Builder(
        ALIAS,
        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
      ).setDigests(KeyProperties.DIGEST_SHA256).build()
    )
    return gen.generateKeyPair()
  }

  private fun amt(a: Double) =
    BigDecimal.valueOf(a).stripTrailingZeros().toPlainString()

  fun payload(
    intent: String, r: String, a: Double, c: String, ch: String, exp: Long
  ) = listOf(intent, r, amt(a), c, ch, exp.toString())
      .joinToString("|").toByteArray()

  fun sign(p: ByteArray): Pair<String,String> {
    val kp = keyPair()
    val s = Signature.getInstance("SHA256withECDSA")
    s.initSign(kp.private)
    s.update(p)
    return Base64.encodeToString(kp.public.encoded, Base64.NO_WRAP) to
           Base64.encodeToString(s.sign(), Base64.NO_WRAP)
  }
}
