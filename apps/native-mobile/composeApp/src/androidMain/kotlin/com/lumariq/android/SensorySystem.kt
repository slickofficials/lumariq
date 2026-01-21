package com.lumariq.android

import android.content.Context
import android.os.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

class SensorySystem(context: Context) {
    private val vibrator =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
        else context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

    fun feedbackClick() {
        if (vibrator.hasVibrator())
            vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
    }
}

@Composable
fun rememberSensorySystem(): SensorySystem {
    val context = LocalContext.current
    return remember { SensorySystem(context) }
}

