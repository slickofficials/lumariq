package com.lumariq.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { LumariqAppRoot() }
    }
}

@Composable
private fun LumariqAppRoot() {
    val scope = rememberCoroutineScope()
    var status by remember { mutableStateOf("Idle") }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Lumariq Mobile ✅")
        Spacer(Modifier.height(12.dp))

        Button(onClick = {
            status = "Checking backend..."
            scope.launch {
                status = try {
                    val resp = withContext(Dispatchers.IO) { NetworkClient.getHealth() }
                    "Backend says: $resp"
                } catch (e: Exception) {
                    "Backend error: ${e.message ?: "unknown"}"
                }
            }
        }) {
            Text("Ping Backend /health")
        }

        Spacer(Modifier.height(12.dp))
        Text(status)
    }
}
