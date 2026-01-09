package com.lumariq.android.ui.theme

import android.app.Activity
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.text.googlefonts.Font
import com.lumariq.android.R

// --- CYBERPUNK COLOR PALETTE ---
val HackerBlack = Color(0xFF000000)
val TerminalGreen = Color(0xFF00FF41)
val DarkGray = Color(0xFF111111)
val ErrorRed = Color(0xFFFF0055)

private val DarkColorScheme = darkColorScheme(
    primary = TerminalGreen,
    background = HackerBlack,
    surface = DarkGray,
    onPrimary = HackerBlack,
    onBackground = TerminalGreen,
    onSurface = TerminalGreen,
    error = ErrorRed
)

// --- JETBRAINS MONO TYPOGRAPHY ---
val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val fontName = GoogleFont("JetBrains Mono")
val HackerFont = FontFamily(Font(googleFont = fontName, fontProvider = provider))

val HackerTypography = Typography(
    headlineLarge = Typography().headlineLarge.copy(fontFamily = HackerFont, color = TerminalGreen),
    headlineMedium = Typography().headlineMedium.copy(fontFamily = HackerFont, color = TerminalGreen),
    bodyLarge = Typography().bodyLarge.copy(fontFamily = HackerFont, color = TerminalGreen),
    labelSmall = Typography().labelSmall.copy(fontFamily = HackerFont, color = TerminalGreen)
)

@Composable
fun LumariqTheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = HackerBlack.toArgb()
            window.navigationBarColor = HackerBlack.toArgb()
        }
    }
    MaterialTheme(colorScheme = DarkColorScheme, typography = HackerTypography, content = content)
}
