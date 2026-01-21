package com.lumariq.android.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.lumariq.android.ui.theme.TerminalGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReceiptScreen(nav: NavController) {
    val ctx = LocalContext.current
    val prev = nav.previousBackStackEntry
    val h = prev?.savedStateHandle

    val counterparty = h?.get<String>("receipt_counterparty") ?: "Unknown"
    val memo = h?.get<String>("receipt_memo") ?: ""
    val createdAt = h?.get<String>("receipt_createdAt") ?: ""
    val txid = h?.get<String>("receipt_id") ?: (h?.get<String>("receipt_txid") ?: "UNKNOWN")
    val amount = h?.get<String>("receipt_amount") ?: "+$0.00"

    // Optional detail fields (if you set them later)
    val status = h?.get<String>("receipt_status") ?: ""
    val type = h?.get<String>("receipt_type") ?: ""
    val currency = h?.get<String>("receipt_currency") ?: "USD"

    var showDetails by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            TopAppBar(
                title = { Text(">_ RECEIPT", color = TerminalGreen, fontWeight = FontWeight.Bold) },
                navigationIcon = { TextButton(onClick = { nav.popBackStack() }) { Text("< BACK", color = TerminalGreen) } },
                actions = {
                    TextButton(onClick = { showDetails = !showDetails }) {
                        Text(if (showDetails) "HIDE" else "DETAILS", color = TerminalGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        }
    ) { pad ->
        Column(Modifier.fillMaxSize().padding(pad).padding(16.dp)) {

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF111111)),
                border = BorderStroke(1.dp, Color(0xFF333333)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(counterparty, color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)

                    Spacer(Modifier.height(6.dp))
                    Text(createdAt.ifBlank { "â€”" }.replace("T"," "), color = Color.Gray, style = MaterialTheme.typography.labelSmall)

                    if (memo.isNotBlank()) {
                        Spacer(Modifier.height(8.dp))
                        Text(memo, color = Color(0xFF9E9E9E), style = MaterialTheme.typography.labelSmall)
                    }

                    Spacer(Modifier.height(10.dp))
                    Text("TXID: $txid", color = Color(0xFFBDBDBD), style = MaterialTheme.typography.labelSmall)

                    Spacer(Modifier.height(10.dp))
                    Text("AMOUNT: $amount $currency", color = TerminalGreen, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

                    if (showDetails) {
                        Spacer(Modifier.height(12.dp))
                        Divider(color = Color(0xFF2A2A2A))
                        Spacer(Modifier.height(10.dp))
                        DetailRow("STATUS", status.ifBlank { "â€”" })
                        DetailRow("TYPE", type.ifBlank { "â€”" })
                        DetailRow("CURRENCY", currency.ifBlank { "USD" })
                        DetailRow("RAW TIME", createdAt.ifBlank { "â€”" })
                        DetailRow("RAW MEMO", memo.ifBlank { "â€”" })
                    }
                }
            }

            Spacer(Modifier.height(14.dp))

            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    modifier = Modifier.weight(1f),
                    onClick = { copyToClipboard(ctx, "TXID", txid) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222222))
                ) { Text("COPY TXID", color = Color.White) }

                Button(
                    modifier = Modifier.weight(1f),
                    onClick = {
                        shareText(ctx,
                            "LUMARIQ RECEIPT\\n$counterparty\\n$createdAt\\n$memo\\nTXID: $txid\\nAMOUNT: $amount $currency\\nSTATUS: ${status.ifBlank { "â€”" }}\\nTYPE: ${type.ifBlank { "â€”" }}"
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222222))
                ) { Text("SHARE", color = Color.White) }
            }
        }
    }
}

@Composable
private fun DetailRow(k: String, v: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(k, color = Color(0xFF9E9E9E), style = MaterialTheme.typography.labelSmall)
        Text(v, color = Color(0xFFE0E0E0), style = MaterialTheme.typography.labelSmall)
    }
    Spacer(Modifier.height(6.dp))
}

private fun copyToClipboard(ctx: Context, label: String, text: String) {
    val cm = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    cm.setPrimaryClip(ClipData.newPlainText(label, text))
}

private fun shareText(ctx: Context, text: String) {
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    ctx.startActivity(Intent.createChooser(intent, "Share Receipt").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}

