package com.lumariq.android

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent

object BiometricGate {
    /**
     * Uses device credential (PIN/pattern/biometric via lock screen).
     * No FragmentActivity required. Works clean in Compose.
     */
    fun createDeviceCredentialIntent(activity: Activity): Intent? {
        val km = activity.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (!km.isDeviceSecure) return null
        return km.createConfirmDeviceCredentialIntent(
            "Authorize Transfer",
            "Confirm using device lock"
        )
    }
}

