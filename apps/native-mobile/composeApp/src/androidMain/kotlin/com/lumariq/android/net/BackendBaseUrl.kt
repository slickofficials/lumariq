package com.lumariq.android.net

import android.os.Build

object BackendBaseUrl {
    // Local dev on emulator hits host PC via 10.0.2.2
    private const val EMULATOR_HOST = "http://10.0.2.2:8080"

    // Local dev on REAL device hits host PC via adb reverse (maps device 127.0.0.1:8080 -> PC 8080)
    private const val DEVICE_REVERSE_HOST = "http://127.0.0.1:8080"

    // Production placeholder (set later)
    private const val PROD_HOST = "https://api.lumariq.com"

    fun current(isProd: Boolean = false): String {
        if (isProd) return PROD_HOST
        return if (isEmulator()) EMULATOR_HOST else DEVICE_REVERSE_HOST
    }

    private fun isEmulator(): Boolean {
        val fp = Build.FINGERPRINT ?: ""
        return fp.contains("generic", true) ||
                fp.contains("unknown", true) ||
                Build.MODEL.contains("google_sdk", true) ||
                Build.MODEL.contains("Emulator", true) ||
                Build.MODEL.contains("Android SDK built for", true) ||
                Build.MANUFACTURER.contains("Genymotion", true)
    }
}
