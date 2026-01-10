package com.lumariq.android

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

class SensorySystem(context: Context) {
    
    private val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        manager.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    // 🛡️ SAFEGUARD: Try-Catch prevents crashes if permission/hardware fails
    private fun safeVibrate(action: () -> Unit) {
        try {
            action()
        } catch (e: Exception) {
            // Hardware/Permission fail? We stay silent and alive.
        }
    }

    private val toneGenerator = try {
        ToneGenerator(AudioManager.STREAM_SYSTEM, 100)
    } catch (e: Exception) {
        null 
    }

    fun feedbackClick() {
        safeVibrate {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
            } else {
                vibrator.vibrate(10)
            }
        }
    }

    fun feedbackSuccess() {
        safeVibrate {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 50, 50, 100), -1))
            } else {
                vibrator.vibrate(200)
            }
        }
        toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP)
    }

    fun feedbackError() {
        safeVibrate {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(300, VibrationEffect.DEFAULT_AMPLITUDE))
            }
        }
        toneGenerator?.startTone(ToneGenerator.TONE_CDMA_SOFT_ERROR_LITE)
    }

    fun feedbackRadarBlip() {
        safeVibrate {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(20, VibrationEffect.DEFAULT_AMPLITUDE))
            }
        }
        toneGenerator?.startTone(ToneGenerator.TONE_CDMA_PIP, 50)
    }

    fun feedbackUnlock() {
        safeVibrate {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(100, 255))
            }
        }
        toneGenerator?.startTone(ToneGenerator.TONE_CDMA_CONFIRM)
    }
}

@Composable
fun rememberSensorySystem(): SensorySystem {
    val context = LocalContext.current
    return remember(context) { SensorySystem(context) }
}
