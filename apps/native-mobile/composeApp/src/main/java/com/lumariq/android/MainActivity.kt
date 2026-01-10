package com.lumariq.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.lumariq.android.ui.theme.LumariqTheme
import com.lumariq.shared.LumariqKernelV1
import com.lumariq.shared.SimulatedLumariqKernel
import com.lumariq.shared.models.UserTier
import com.lumariq.shared.models.WalletState

class MainActivity : ComponentActivity() {
    private val kernel: LumariqKernelV1 = SimulatedLumariqKernel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val user = kernel.biometricLogin("sig_secure")
        val walletState = kernel.getWalletState()

        setContent {
            LumariqTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()
                    val context = LocalContext.current
                    val store = remember { UserPreferences(context) }
                    val sensory = rememberSensorySystem() // 🧠 INITIALIZE SENSES

                    val stealthMode by store.stealthModeFlow.collectAsState(initial = false)
                    val txHistory by store.txHistoryFlow.collectAsState(initial = emptyList())
                    val revenue by store.revenueFlow.collectAsState(initial = 0.0)

                    NavHost(navController = navController, startDestination = "login") {
                        // Pass 'sensory' to all screens
                        composable("login") { LoginScreen(navController, sensory) }
                        
                        composable("dashboard") {
                            val totalBalance = walletState.localBalance + revenue
                            HackerDashboard(navController, user.handle, user.tier, totalBalance, walletState.localCurrency, stealthMode, txHistory, sensory)
                        }
                        composable("transfer") { TransferScreen(navController, sensory) }
                        composable("analytics") { AnalyticsScreen(navController) }
                        composable("map") { SurgeMapScreen(navController, sensory) }
                        composable("security") { SecurityScreen(navController) }
                        composable("profile") { ProfileScreen(navController) }
                    }
                }
            }
        }
    }
}

// 🔊 UPDATE DASHBOARD TO USE SENSORY
@Composable
fun HackerDashboard(
    navController: NavController, userHandle: String, tier: UserTier, balance: Double, currency: String, isStealthMode: Boolean, txHistory: List<String>,
    sensory: SensorySystem
) {
    Scaffold(containerColor = Color.Transparent) { padding ->
        Column(modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(), verticalArrangement = Arrangement.spacedBy(24.dp)) {
            HeaderSection(navController, userHandle, tier)
            AnimatedLiquidityCard(balance, currency, isStealthMode)
            
            Text("SYSTEM FUNCTIONS", style = MaterialTheme.typography.labelSmall)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // ADD CLICKS
                CompactButton("TRANSFER", { sensory.feedbackClick(); navController.navigate("transfer") }, Modifier.weight(1f))
                CompactButton("RADAR", { sensory.feedbackClick(); navController.navigate("map") }, Modifier.weight(1f))
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CompactButton("ANALYTICS", { sensory.feedbackClick(); navController.navigate("analytics") }, Modifier.weight(1f))
                CompactButton("SECURITY", { sensory.feedbackClick(); navController.navigate("security") }, Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("RECENT TRANSMISSIONS [${txHistory.size}]", style = MaterialTheme.typography.labelSmall)
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
                if (txHistory.isEmpty()) { item { Text(">_ NO ACTIVITY LOGGED", color = Color.Gray) } } 
                else { items(txHistory.reversed()) { record -> 
                    val parts = record.split("|")
                    if (parts.size == 3) TxRow(parts[0], parts[1], parts[2], isStealthMode)
                }}
            }
        }
    }
}

@Composable
fun TxRow(amount: String, recipient: String, hash: String, isStealth: Boolean) {
    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111)), border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)), modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(12.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text(recipient, style = MaterialTheme.typography.bodyMedium, color = Color.White)
                Text(hash.take(10) + "...", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            Text(if (isStealth) "****" else amount, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun CompactButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    OutlinedButton(onClick = onClick, colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.primary), border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)), shape = RoundedCornerShape(4.dp), modifier = modifier.height(48.dp), contentPadding = PaddingValues(0.dp)) {
        Text(label, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
fun HeaderSection(navController: NavController, handle: String, tier: UserTier) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(initialValue = 1f, targetValue = 0.2f, animationSpec = infiniteRepeatable(animation = tween(1000), repeatMode = RepeatMode.Reverse), label = "alpha")
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (tier == UserTier.GOVERNOR) { Text("⚠️ COMMANDER ACCESS GRANTED", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.error, modifier = Modifier.alpha(alpha)) }
        Text(text = ">_ Welcome, $handle", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.clickable { navController.navigate("profile") })
    }
}

@Composable
fun AnimatedLiquidityCard(balance: Double, currency: String, isStealth: Boolean) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary), modifier = Modifier.fillMaxWidth().height(200.dp)) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp)) {
            Column(modifier = Modifier.align(Alignment.TopStart)) {
                Text("TOTAL LIQUIDITY", style = MaterialTheme.typography.labelSmall)
                Spacer(modifier = Modifier.height(8.dp))
                if (isStealth) {
                    Text("****.00 $currency", style = MaterialTheme.typography.headlineLarge)
                    Text("****.00 USDC", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
                } else {
                    Text("$balance $currency", style = MaterialTheme.typography.headlineLarge)
                    Text("$2500.0 USDC", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
                }
            }
            val primaryColor = MaterialTheme.colorScheme.primary
            Canvas(modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(60.dp)) {
                val path = Path()
                path.moveTo(0f, size.height)
                path.cubicTo(size.width * 0.25f, size.height * 0.5f, size.width * 0.75f, size.height * 0.8f, size.width, size.height * 0.2f)
                drawPath(path = path, color = primaryColor, style = Stroke(width = 4f))
            }
        }
    }
}
