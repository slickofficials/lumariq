package com.lumariq.shared

import com.lumariq.shared.models.*

// The Contract: What the Kernel MUST do
interface LumariqKernelV1 {
    fun biometricLogin(signature: String): User
    fun getWalletState(): WalletState
}

// The Simulation: Fake it 'til we make it (gRPC goes here later)
class SimulatedLumariqKernel : LumariqKernelV1 {
    override fun biometricLogin(signature: String): User {
        // Simulating a Governor login
        return User(
            id = "uid_882",
            handle = "@Slick_CEO",
            tier = UserTier.GOVERNOR 
        )
    }

    override fun getWalletState(): WalletState {
        return WalletState(
            localBalance = 450000.00,
            localCurrency = "NGN",
            stableBalance = 2500.00,
            isShielded = true
        )
    }
}
