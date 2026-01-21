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
fun SecurityScreen(nav: NavController) {
    Scaffold(containerColor = Color.Black) { pad ->
        Box(Modifier.fillMaxSize().padding(pad), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(">_ SECURITY", color = TerminalGreen)
                Spacer(Modifier.height(12.dp))
                Text("Device lock gate + Keystore signing enabled.", color = Color.Gray)
                Spacer(Modifier.height(16.dp))
                Button(onClick = { nav.popBackStack() }) { Text("BACK") }
            }
        }
    }
}

