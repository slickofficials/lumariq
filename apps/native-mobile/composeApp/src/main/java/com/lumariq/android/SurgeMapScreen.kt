package com.lumariq.android

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import kotlinx.coroutines.launch
import kotlin.math.pow
import kotlin.math.sqrt
import kotlin.random.Random

data class SurgeNode(val id: String, val x: Float, val y: Float, val value: Double)

@Composable
fun SurgeMapScreen(navController: NavController, sensory: SensorySystem) {
    val context = LocalContext.current
    val store = remember { UserPreferences(context) }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    val infiniteTransition = rememberInfiniteTransition(label = "radar")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(animation = tween(4000, easing = LinearEasing)),
        label = "rotation"
    )

    val nodes = remember {
        List(15) { 
            SurgeNode(id = "NODE-${Random.nextInt(1000, 9999)}", x = Random.nextFloat(), y = Random.nextFloat(), value = Random.nextDouble(5000.0, 25000.0))
        }
    }

    Scaffold(containerColor = Color.Transparent, snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(">_ SURGE RADAR", style = MaterialTheme.typography.headlineMedium)
                Text("SECTOR: LAGOS", color = TerminalGreen, style = MaterialTheme.typography.labelSmall)
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF050505)),
                border = BorderStroke(1.dp, TerminalGreen),
                modifier = Modifier.fillMaxWidth().aspectRatio(1f)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .pointerInput(Unit) {
                                detectTapGestures { tapOffset ->
                                    val width = size.width.toFloat()
                                    val height = size.height.toFloat()
                                    val radius = minOf(width, height) / 2 - 20f
                                    val center = Offset(width / 2, height / 2)
                                    nodes.forEach { node ->
                                        val nodeX = center.x + (node.x - 0.5f) * 2 * (radius * 0.9f)
                                        val nodeY = center.y + (node.y - 0.5f) * 2 * (radius * 0.9f)
                                        val dist = sqrt((tapOffset.x - nodeX).pow(2) + (tapOffset.y - nodeY).pow(2))
                                        if (dist < 40f) { 
                                            // 🔊 SENSORY FEEDBACK
                                            sensory.feedbackRadarBlip()
                                            scope.launch {
                                                store.addRevenue(node.value)
                                                snackbarHostState.showSnackbar("🚀 DISPATCHED: ${node.id} | +${node.value.toInt()} NGN")
                                            }
                                        }
                                    }
                                }
                            }
                    ) {
                        val center = center
                        val radius = size.minDimension / 2 - 20f
                        drawCircle(color = TerminalGreen.copy(alpha = 0.3f), radius = radius, style = Stroke(width = 2f))
                        drawCircle(color = TerminalGreen.copy(alpha = 0.1f), radius = radius * 0.66f, style = Stroke(width = 2f))
                        nodes.forEach { node ->
                            val nodeX = center.x + (node.x - 0.5f) * 2 * (radius * 0.9f)
                            val nodeY = center.y + (node.y - 0.5f) * 2 * (radius * 0.9f)
                            drawCircle(color = TerminalGreen.copy(alpha = 0.8f), radius = 8f, center = Offset(nodeX, nodeY))
                            drawCircle(color = TerminalGreen.copy(alpha = 0.3f), radius = 16f, center = Offset(nodeX, nodeY))
                        }
                        rotate(degrees = rotation, pivot = center) {
                            drawCircle(brush = Brush.sweepGradient(colors = listOf(Color.Transparent, TerminalGreen.copy(alpha = 0.5f)), center = center), radius = radius, center = center)
                            drawLine(color = TerminalGreen, start = center, end = Offset(center.x + radius, center.y), strokeWidth = 4f)
                        }
                    }
                    Text("TAP NODES TO DISPATCH", color = TerminalGreen, style = MaterialTheme.typography.labelSmall, modifier = Modifier.align(Alignment.BottomStart).padding(16.dp))
                }
            }

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                StatCard("DEMAND", "CRITICAL", Modifier.weight(1f))
                StatCard("REVENUE", "ACTIVE", Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.weight(1f))
            OutlinedButton(
                onClick = { sensory.feedbackClick(); navController.popBackStack() },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TerminalGreen),
                border = BorderStroke(1.dp, TerminalGreen),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("<< RETURN TO COMMAND")
            }
        }
    }
}
