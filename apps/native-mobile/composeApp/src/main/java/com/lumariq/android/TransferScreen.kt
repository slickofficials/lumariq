package com.lumariq.android

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen
import com.lumariq.android.ui.theme.HackerBlack
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class TxState { IDLE, PROCESSING, SUCCESS, FAILED }

@Composable
fun TransferScreen(navController: NavController, sensory: SensorySystem) {
    var amount by remember { mutableStateOf("") }
    var recipient by remember { mutableStateOf("") }
    var txState by remember { mutableStateOf(TxState.IDLE) }
    var terminalLog by remember { mutableStateOf("") }
    var txHash by remember { mutableStateOf("") }
    
    val context = LocalContext.current
    val store = remember { UserPreferences(context) }
    val scope = rememberCoroutineScope()

    fun executeTransfer() {
        if (amount.isBlank() || recipient.isBlank()) {
            sensory.feedbackError() // ERROR BUZZ
            return
        }
        
        scope.launch {
            sensory.feedbackClick()
            txState = TxState.PROCESSING
            terminalLog = "> INITIATING HANDSHAKE..."
            delay(600)
            terminalLog += "\n> ENCRYPTING PAYLOAD [AES-256]..."
            delay(800)
            terminalLog += "\n> VERIFYING BIOMETRICS..."
            delay(700)
            terminalLog += "\n> BROADCASTING TO LEDGER..."
            delay(600)
            
            val charPool = "A-Z0-9"
            txHash = "0x" + (1..16).map { Random.nextInt(0, charPool.length) }.joinToString("")
            store.addTransaction(amount, recipient, txHash)
            
            // 🔊 SENSORY FEEDBACK
            sensory.feedbackSuccess()
            txState = TxState.SUCCESS
        }
    }

    Scaffold(containerColor = Color.Transparent) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            
            if (txState == TxState.IDLE) {
                Column(
                    modifier = Modifier.padding(24.dp).fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    Text(">_ INITIATE TRANSFER", style = MaterialTheme.typography.headlineMedium)

                    OutlinedTextField(
                        value = amount,
                        onValueChange = { amount = it },
                        label = { Text("AMOUNT (NGN)", color = TerminalGreen) },
                        textStyle = MaterialTheme.typography.displayMedium.copy(color = TerminalGreen),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TerminalGreen,
                            unfocusedBorderColor = TerminalGreen.copy(alpha = 0.5f),
                            focusedTextColor = TerminalGreen,
                            unfocusedTextColor = TerminalGreen
                        )
                    )

                    OutlinedTextField(
                        value = recipient,
                        onValueChange = { recipient = it },
                        label = { Text("RECIPIENT ID / TAG", color = TerminalGreen) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TerminalGreen,
                            unfocusedBorderColor = TerminalGreen.copy(alpha = 0.5f),
                            focusedTextColor = TerminalGreen,
                            unfocusedTextColor = TerminalGreen
                        )
                    )

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = { executeTransfer() },
                        colors = ButtonDefaults.buttonColors(containerColor = TerminalGreen),
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.fillMaxWidth().height(56.dp)
                    ) {
                        Text(">>> AUTHORIZE TRANSACTION", color = Color.Black, style = MaterialTheme.typography.titleMedium)
                    }

                    OutlinedButton(
                        onClick = { sensory.feedbackClick(); navController.popBackStack() },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("ABORT", color = MaterialTheme.colorScheme.error)
                    }
                }
            }

            if (txState == TxState.PROCESSING) {
                Column(
                    modifier = Modifier.fillMaxSize().background(HackerBlack.copy(alpha = 0.95f)).padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.Start
                ) {
                    Text("PROCESSING REQUEST...", color = TerminalGreen, style = MaterialTheme.typography.labelSmall)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(terminalLog, color = TerminalGreen, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, lineHeight = 24.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    CircularProgressIndicator(color = TerminalGreen)
                }
            }

            if (txState == TxState.SUCCESS) {
                Column(
                    modifier = Modifier.fillMaxSize().background(HackerBlack).padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("TRANSACTION SUCCESSFUL", color = TerminalGreen, style = MaterialTheme.typography.headlineMedium)
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111)), border = BorderStroke(1.dp, TerminalGreen), modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(24.dp)) {
                            ReceiptRow("AMOUNT", "$amount NGN")
                            ReceiptRow("RECIPIENT", recipient)
                            ReceiptRow("STATUS", "CONFIRMED")
                            HorizontalDivider(color = TerminalGreen.copy(alpha = 0.3f), modifier = Modifier.padding(vertical = 12.dp))
                            Text("TX HASH:", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                            Text(txHash, style = MaterialTheme.typography.bodyMedium, color = TerminalGreen)
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    Button(
                        onClick = { sensory.feedbackClick(); navController.popBackStack() },
                        colors = ButtonDefaults.buttonColors(containerColor = TerminalGreen),
                        modifier = Modifier.fillMaxWidth().height(56.dp)
                    ) {
                        Text("RETURN TO COMMAND", color = Color.Black)
                    }
                }
            }
        }
    }
}

@Composable
fun ReceiptRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Color.Gray, style = MaterialTheme.typography.bodyMedium)
        Text(value, color = TerminalGreen, style = MaterialTheme.typography.titleMedium)
    }
}
