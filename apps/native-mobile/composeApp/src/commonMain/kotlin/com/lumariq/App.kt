package com.lumariq

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun App() {
  MaterialTheme {
    Surface(modifier = Modifier.fillMaxSize()) {
      Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("LUMARIQ ✅", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))
        Text("Root UI is live. Next: wire navigation + backend calls.")
        Spacer(Modifier.height(16.dp))
        Button(onClick = { }) { Text("Continue") }
      }
    }
  }
}
