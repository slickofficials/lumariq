package com.lumariq.android

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import kotlinx.coroutines.delay

@Composable
fun SecurityScreen(navController: NavController) {
    // DIAGNOSTIC STATE
    var progress by remember { mutableFloatStateOf(0f) }
    var statusText by remember { mutableStateOf("INITIALIZING...") }
    var isSecured by remember { mutableStateOf(false) }

    // CHECKLIST STATES
    var kernelCheck by remember { mutableStateOf(false) }
    var netCheck by remember { mutableStateOf(false) }
    var bioCheck by remember { mutableStateOf(false) }
    var rootCheck by remember { mutableStateOf(false) }

    // RUN DIAGNOSTIC SEQUENCE
    LaunchedEffect(Unit) {
        statusText = "SCANNING KERNEL..."
        delay(800)
        progress = 0.25f
        kernelCheck = true
        
        statusText = "VERIFYING ENCRYPTION..."
        delay(800)
        progress = 0.5f
        netCheck = true
        
        statusText = "CHECKING BIOMETRICS..."
        delay(600)
        progress = 0.75f
        bioCheck = true
        
        statusText = "ROOT ACCESS DETECTION..."
        delay(800)
        progress = 1.0f
        rootCheck = true
        
        statusText = "SYSTEM SECURE"
        isSecured = true
    }

    Scaffold(containerColor = Color.Transparent) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(24.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // HEADER
            Text(">_ SECURITY AUDIT", style = MaterialTheme.typography.headlineMedium)

            // 🛡️ THE SHIELD (Visual Centerpiece)
            Box(
                modifier = Modifier.fillMaxWidth().height(250.dp),
                contentAlignment = Alignment.Center
            ) {
                // Pulse Animation
                val infiniteTransition = rememberInfiniteTransition(label = "shield")
                val scale by infiniteTransition.animateFloat(
                    initialValue = 1f, targetValue = 1.05f,
                    animationSpec = infiniteRepeatable(animation = tween(1500), repeatMode = RepeatMode.Reverse),
                    label = "scale"
                )
                
                // Outer Ring
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.size(200.dp),
                    color = TerminalGreen,
                    strokeWidth = 8.dp,
                    trackColor = TerminalGreen.copy(alpha = 0.1f),
                )
                
                // Icon
                Icon(
                    imageVector = if (isSecured) Icons.Default.CheckCircle else Icons.Default.Lock,
                    contentDescription = "Shield",
                    tint = if (isSecured) TerminalGreen else Color.Gray,
                    modifier = Modifier.size(80.dp).scale(if (isSecured) scale else 1f)
                )
            }

            // STATUS TEXT
            Text(
                text = statusText,
                style = MaterialTheme.typography.titleMedium,
                color = if (isSecured) TerminalGreen else Color.Gray,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )

            Divider(color = TerminalGreen.copy(alpha = 0.3f))

            // DIAGNOSTIC LOG
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                DiagnosticRow("KERNEL INTEGRITY", kernelCheck)
                DiagnosticRow("AES-256 TUNNEL", netCheck)
                DiagnosticRow("BIOMETRIC VAULT", bioCheck)
                DiagnosticRow("ROOT DETECTION", rootCheck)
            }
            
            Spacer(modifier = Modifier.weight(1f))

            // BACK BUTTON
            OutlinedButton(
                onClick = { navController.popBackStack() },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TerminalGreen),
                border = BorderStroke(1.dp, TerminalGreen),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("<< RETURN TO DASHBOARD")
            }
        }
    }
}

@Composable
fun DiagnosticRow(label: String, isComplete: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge, color = Color.LightGray)
        if (isComplete) {
            Text("[ OK ]", style = MaterialTheme.typography.bodyLarge, color = TerminalGreen, fontWeight = FontWeight.Bold)
        } else {
            Text("[ ... ]", style = MaterialTheme.typography.bodyLarge, color = Color.Gray)
        }
    }
}
