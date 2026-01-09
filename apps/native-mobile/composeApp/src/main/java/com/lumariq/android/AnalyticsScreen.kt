package com.lumariq.android

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen

@Composable
fun AnalyticsScreen(navController: NavController) {
    Scaffold(containerColor = Color.Transparent) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(">_ LIQUIDITY FLOW", style = MaterialTheme.typography.headlineMedium)
                Text("LIVE", color = TerminalGreen, style = MaterialTheme.typography.labelSmall)
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0A0A0A)),
                border = BorderStroke(1.dp, TerminalGreen.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth().height(300.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Text("7-DAY VOLUME", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                    
                    Canvas(modifier = Modifier.fillMaxSize().padding(top = 24.dp)) {
                        val width = size.width
                        val height = size.height
                        val points = listOf(0.2f, 0.4f, 0.3f, 0.7f, 0.5f, 0.9f, 0.8f)
                        val path = Path()
                        val stepX = width / (points.size - 1)
                        
                        points.forEachIndexed { i, p ->
                            val x = i * stepX
                            val y = height - (p * height)
                            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
                        }

                        val fillPath = Path().apply {
                            addPath(path)
                            lineTo(width, height)
                            lineTo(0f, height)
                            close()
                        }
                        
                        drawPath(path = fillPath, brush = Brush.verticalGradient(colors = listOf(TerminalGreen.copy(alpha = 0.3f), Color.Transparent)))
                        drawPath(path = path, color = TerminalGreen, style = Stroke(width = 5f, cap = StrokeCap.Round))
                        
                        points.forEachIndexed { i, p ->
                             val x = i * stepX
                             val y = height - (p * height)
                             drawCircle(Color.Black, radius = 10f, center = Offset(x, y))
                             drawCircle(TerminalGreen, radius = 6f, center = Offset(x, y))
                        }
                    }
                }
            }

            // SHARED COMPONENT USED HERE
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                StatCard("INFLOW", "+12.4%", Modifier.weight(1f))
                StatCard("OUTFLOW", "-3.2%", Modifier.weight(1f))
            }
            
            Spacer(modifier = Modifier.weight(1f))

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
