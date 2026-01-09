package com.lumariq.android

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons

import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import com.lumariq.android.ui.theme.HackerBlack
import kotlinx.coroutines.delay

@Composable
fun LoginScreen(navController: NavController) {
    var isAuthenticating by remember { mutableStateOf(false) }
    var authStatus by remember { mutableStateOf("IDENTITY REQUIRED") }
    var authColor by remember { mutableStateOf(Color.Gray) }

    // PULSE ANIMATION
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f, targetValue = 1.1f,
        animationSpec = infiniteRepeatable(animation = tween(1500), repeatMode = RepeatMode.Reverse),
        label = "scale"
    )

    // AUTHENTICATION LOGIC
    LaunchedEffect(isAuthenticating) {
        if (isAuthenticating) {
            authStatus = "SCANNING BIOMETRICS..."
            authColor = TerminalGreen
            delay(1500) // Simulate scan time
            authStatus = "ACCESS GRANTED"
            delay(500)
            // 🚀 LAUNCH DASHBOARD
            navController.navigate("dashboard") {
                popUpTo("login") { inclusive = true } // Remove login from backstack
            }
        }
    }

    Scaffold(containerColor = HackerBlack) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.weight(1f))

            // 🔐 THE SCANNER BUTTON
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(120.dp)
                    .scale(if (isAuthenticating) 1.2f else scale)
                    .background(color = TerminalGreen.copy(alpha = 0.1f), shape = CircleShape)
                    .clickable(enabled = !isAuthenticating) { isAuthenticating = true }
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Auth",
                    tint = authColor,
                    modifier = Modifier.size(64.dp)
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = authStatus,
                style = MaterialTheme.typography.titleMedium,
                color = authColor,
                modifier = Modifier.alpha(if (isAuthenticating) 1f else 0.7f)
            )

            Spacer(modifier = Modifier.weight(1f))

            // FOOTER
            Text(
                "LUMARIQ SECURE GATEWAY", 
                style = MaterialTheme.typography.labelSmall, 
                color = Color.DarkGray,
                modifier = Modifier.padding(bottom = 32.dp)
            )
        }
    }
}
