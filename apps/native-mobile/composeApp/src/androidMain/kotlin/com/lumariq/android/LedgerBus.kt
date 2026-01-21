package com.lumariq.android

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Simple refresh signal. UI can collect LedgerBus.tick to reload transactions.
 */
object LedgerBus {
    private val _tick = MutableStateFlow(0)
    val tick: StateFlow<Int> = _tick

    fun bump() { _tick.value = _tick.value + 1 }
}

