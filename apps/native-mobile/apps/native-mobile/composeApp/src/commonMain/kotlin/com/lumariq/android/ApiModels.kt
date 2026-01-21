package com.lumariq.android

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TransactionDto(
    val id: String,
    val type: String? = null,
    val amount: Long,
    val currency: String,
    val status: String,
    val counterparty: String? = null,
    val memo: String? = null,
    val createdAt: String? = null
)

@Serializable
data class PrepareTransferReq(
    val recipient: String,
    val amount: Double,
    val currency: String = "USD"
)

@Serializable
data class PrepareTransferResp(
    val intentId: String,
    val challenge: String,
    val expiresAt: String
)

@Serializable
data class ConfirmTransferReq(
    val intentId: String,
    val publicKeyB64: String,
    val signatureB64: String
)

@Serializable
data class ConfirmTransferResp(
    val status: String,
    val txId: String,
    val message: String = ""
)

@Serializable
data class TransferReq(val recipient: String, val amount: Double)

@Serializable
data class TransferResp(val status: String, val txId: String, val message: String)
