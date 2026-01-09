package com.lumariq.shared.models

enum class UserTier {
    CITIZEN,
    GOVERNOR, // Commander Access
    MERCHANT
}

data class User(
    val id: String,
    val handle: String,
    val tier: UserTier
)

data class WalletState(
    val localBalance: Double,
    val localCurrency: String,
    val stableBalance: Double,
    val isShielded: Boolean
)
