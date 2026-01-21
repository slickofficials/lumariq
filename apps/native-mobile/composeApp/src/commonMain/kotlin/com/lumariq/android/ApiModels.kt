package com.lumariq.android

import kotlinx.serialization.Serializable

@Serializable
data class PrepareTransferReq(
    val recipient: String,
    val amount: Double,
    val currency: String = "USD"
)

@Serializable
data class PrepareTransferResp(
    val ok: Boolean,
    val intentId: String = "",
    val challenge: String = "",
    val expiresAt: String = "",
    val message: String = ""
)

@Serializable
data class ConfirmTransferReq(
    val intentId: String,
    val publicKeyB64: String,
    val signatureB64: String,
    val recipient: String,
    val amount: Double,
    val currency: String,
    val challenge: String,
    val expiresAt: String
)

@Serializable
data class ConfirmTransferResp(
    val ok: Boolean,
    val status: String = "",
    val message: String = ""
)

@kotlinx.serialization.Serializable
data class TransactionDto(
    val id: String = "",
    val recipient: String = "",
    val amount: Double = 0.0,
    val currency: String = "USD",
    val status: String = "",
    val createdAt: String = ""
)
