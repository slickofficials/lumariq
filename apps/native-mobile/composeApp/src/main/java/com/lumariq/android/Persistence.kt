package com.lumariq.android

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "lumariq_neural_config")

class UserPreferences(private val context: Context) {
    
    private val STEALTH_MODE_KEY = booleanPreferencesKey("stealth_mode")
    private val TX_HISTORY_KEY = stringSetPreferencesKey("tx_history_v1")
    private val REVENUE_KEY = doublePreferencesKey("revenue_generated")

    val stealthModeFlow: Flow<Boolean> = context.dataStore.data.map { it[STEALTH_MODE_KEY] ?: false }
    val txHistoryFlow: Flow<List<String>> = context.dataStore.data.map { it[TX_HISTORY_KEY]?.toList() ?: emptyList() }
    
    // READ REVENUE
    val revenueFlow: Flow<Double> = context.dataStore.data.map { it[REVENUE_KEY] ?: 0.0 }

    suspend fun setStealthMode(enabled: Boolean) {
        context.dataStore.edit { it[STEALTH_MODE_KEY] = enabled }
    }

    suspend fun addTransaction(amount: String, recipient: String, hash: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[TX_HISTORY_KEY] ?: emptySet()
            prefs[TX_HISTORY_KEY] = current + "$amount|$recipient|$hash"
        }
    }

    // 💰 GENERATE REVENUE
    suspend fun addRevenue(amount: Double) {
        context.dataStore.edit { prefs ->
            val current = prefs[REVENUE_KEY] ?: 0.0
            prefs[REVENUE_KEY] = current + amount
        }
    }
}
