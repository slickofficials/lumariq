package com.lumariq.android

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import com.lumariq.android.ui.theme.HackerBlack
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(val text: String, val isUser: Boolean, val timestamp: Long = System.currentTimeMillis())

@Composable
fun ChatScreen(navController: NavController, sensory: SensorySystem) {
    var inputText by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf<ChatMessage>() }
    val listState = rememberLazyListState()
    val keyboardController = LocalSoftwareKeyboardController.current
    val scope = rememberCoroutineScope()

    // 🧠 INITIAL GREETING
    LaunchedEffect(Unit) {
        if (messages.isEmpty()) {
            delay(500)
            messages.add(ChatMessage("Lumariq Neural Core Online. Awaiting command.", false))
            sensory.feedbackRadarBlip()
        }
    }

    // 🧠 AUTO-SCROLL
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    fun sendMessage() {
        if (inputText.isBlank()) return
        
        val userMsg = inputText
        messages.add(ChatMessage(userMsg, true))
        inputText = ""
        keyboardController?.hide()
        sensory.feedbackClick()

        // 🧠 SIMULATED AGI RESPONSE LOGIC
        scope.launch {
            delay(800) // Thinking time...
            
            val response = when {
                userMsg.contains("balance", ignoreCase = true) -> "Current liquidity across all sectors is stable. Masking protocols are active."
                userMsg.contains("status", ignoreCase = true) -> "All systems nominal. Sentinel Gate: LOCKED. Encryption: AES-256."
                userMsg.contains("transfer", ignoreCase = true) -> "To initiate a transfer, please use the secure transaction terminal in the dashboard."
                userMsg.contains("hello", ignoreCase = true) -> "Greetings, Governor. The Empire is ready."
                userMsg.contains("who are you", ignoreCase = true) -> "I am LUMARIQ. The operating system of your financial sovereignty."
                else -> "Command not recognized. Accessing global database... No match found."
            }
            
            messages.add(ChatMessage(response, false))
            sensory.feedbackSuccess() // Satisfying beep on reply
        }
    }

    Scaffold(
        containerColor = HackerBlack,
        topBar = {
            Box(modifier = Modifier.padding(top = 16.dp, bottom = 8.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text(">_ NEURAL LINK", style = MaterialTheme.typography.titleMedium, color = TerminalGreen)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize().padding(horizontal = 16.dp)
        ) {
            // 📜 CHAT HISTORY
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(msg)
                }
            }

            // ⌨️ INPUT FIELD
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Enter command...", color = Color.Gray) },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TerminalGreen,
                        unfocusedBorderColor = Color.Gray,
                        focusedTextColor = Color.White,
                        cursorColor = TerminalGreen
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { sendMessage() }),
                    shape = RoundedCornerShape(12.dp)
                )

                IconButton(
                    onClick = { sendMessage() },
                    modifier = Modifier.background(TerminalGreen.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = TerminalGreen)
                }
            }
            
            // BACK BUTTON
            Button(
                onClick = { sensory.feedbackClick(); navController.popBackStack() },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                border = BorderStroke(1.dp, TerminalGreen.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Text("TERMINATE SESSION", color = TerminalGreen)
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (message.isUser) Alignment.End else Alignment.Start
    ) {
        Container(message.isUser) {
            Text(
                text = message.text,
                color = if (message.isUser) Color.Black else TerminalGreen,
                style = MaterialTheme.typography.bodyMedium
            )
        }
        Text(
            text = if (message.isUser) "GOVERNOR" else "SYSTEM",
            style = MaterialTheme.typography.labelSmall,
            color = Color.Gray,
            modifier = Modifier.padding(top = 4.dp, start = 4.dp, end = 4.dp)
        )
    }
}

@Composable
fun Container(isUser: Boolean, content: @Composable () -> Unit) {
    Surface(
        color = if (isUser) TerminalGreen else Color(0xFF111111),
        shape = if (isUser) RoundedCornerShape(16.dp, 16.dp, 0.dp, 16.dp) else RoundedCornerShape(16.dp, 16.dp, 16.dp, 0.dp),
        border = if (isUser) null else BorderStroke(1.dp, TerminalGreen.copy(alpha = 0.5f)),
        modifier = Modifier.widthIn(max = 280.dp)
    ) {
        Box(modifier = Modifier.padding(12.dp)) {
            content()
        }
    }
}
