package com.lumariq.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Color
import com.lumariq.shared.LumariqKernelV1
import com.lumariq.shared.SimulatedLumariqKernel
import com.lumariq.shared.models.UserTier

class MainActivity : ComponentActivity() {

    private val kernel: LumariqKernelV1 = SimulatedLumariqKernel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val user = kernel.biometricLogin("sig_secure")
        val walletState = kernel.getWalletState()

        setContent {
            MaterialTheme {
                Scaffold { padding ->
                    Column(
                        modifier = Modifier
                            .padding(padding)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (user.tier == UserTier.GOVERNOR) {
                            Text(
                                "COMMANDER ACCESS",
                                color = Color.Red,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = "Welcome ${user.handle}",
                            style = MaterialTheme.typography.headlineMedium
                        )

                        Card {
                            Column(Modifier.padding(16.dp)) {
                                Text("TOTAL LIQUIDITY")
                                Text(
                                    "${walletState.localBalance} ${walletState.localCurrency}",
                                    style = MaterialTheme.typography.headlineLarge
                                )
                                Text(
                                    "$${walletState.stableBalance} USDC",
                                    color = Color.Green
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
