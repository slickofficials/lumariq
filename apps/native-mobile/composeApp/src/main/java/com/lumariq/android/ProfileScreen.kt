package com.lumariq.android

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import com.lumariq.android.ui.theme.HackerBlack
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(navController: NavController) {
    // 🧠 CONNECT TO MEMORY CORE
    val context = LocalContext.current
    val store = remember { UserPreferences(context) }
    val scope = rememberCoroutineScope()
    
    // Read current state
    val stealthMode by store.stealthModeFlow.collectAsState(initial = false)
    
    var biometricLock by remember { mutableStateOf(true) }
    var notifications by remember { mutableStateOf(true) }

    Scaffold(containerColor = Color.Transparent) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(">_ NEURAL CONFIG", style = MaterialTheme.typography.headlineMedium)

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF111111)),
                border = BorderStroke(1.dp, TerminalGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(24.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier.size(64.dp).clip(CircleShape).background(TerminalGreen.copy(alpha = 0.2f)).border(2.dp, TerminalGreen, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = TerminalGreen, modifier = Modifier.size(32.dp))
                    }
                    Column {
                        Text("COMMANDER", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        Text("@Slick_CEO", style = MaterialTheme.typography.titleLarge, color = Color.White)
                        Spacer(modifier = Modifier.height(4.dp))
                        SuggestionChip(
                            onClick = { },
                            label = { Text("TIER: GOVERNOR") },
                            colors = SuggestionChipDefaults.suggestionChipColors(containerColor = TerminalGreen.copy(alpha = 0.1f), labelColor = TerminalGreen),
                            border = BorderStroke(1.dp, TerminalGreen)
                        )
                    }
                }
            }

            Divider(color = TerminalGreen.copy(alpha = 0.3f))

            Text("SYSTEM OVERRIDE", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // ⚡ WIRE UP THE TOGGLE TO WRITE TO DISK
                ToggleRow("STEALTH MODE", "Mask liquidity on dashboard", stealthMode) { 
                    scope.launch { store.setStealthMode(it) }
                }
                ToggleRow("BIOMETRIC VAULT", "Require fingerprint for transfers", biometricLock) { biometricLock = it }
                ToggleRow("SECURE PUSH", "Encrypted notifications", notifications) { notifications = it }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = { navController.popBackStack() },
                colors = ButtonDefaults.buttonColors(containerColor = TerminalGreen),
                shape = MaterialTheme.shapes.small,
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("SAVE CONFIGURATION", color = Color.Black)
            }
            
            Text("LUMARIQ KERNEL v1.0.6 [PERSISTENT]", style = MaterialTheme.typography.labelSmall, color = Color.DarkGray, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}

@Composable
fun ToggleRow(label: String, subtitle: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(label, style = MaterialTheme.typography.titleMedium, color = Color.White)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = HackerBlack,
                checkedTrackColor = TerminalGreen,
                uncheckedThumbColor = Color.Gray,
                uncheckedTrackColor = Color.DarkGray,
                uncheckedBorderColor = Color.Transparent
            )
        )
    }
}
