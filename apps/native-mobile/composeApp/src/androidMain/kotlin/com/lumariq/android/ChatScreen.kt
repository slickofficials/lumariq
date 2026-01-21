package com.lumariq.android

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen

@Composable
fun ChatScreen(nav: NavController, sensory: SensorySystem) {
    Scaffold(containerColor = Color.Black) { pad ->
        Box(Modifier.fillMaxSize().padding(pad), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(">_ LUMARIQ AI", color = TerminalGreen)
                Spacer(Modifier.height(12.dp))
                Text("Coming online soon.", color = Color.Gray)
                Spacer(Modifier.height(16.dp))
                Button(onClick = { sensory.feedbackClick(); nav.popBackStack() }) { Text("BACK") }
            }
        }
    }
}

