package com.lumariq.android

/**
 * Temporary selection holder for Receipt screen.
 * (Simple + works for now; later replace with SavedStateHandle or ViewModel.)
 */
object TxSelection {
    @Volatile var selected: TransactionDto? = null
}

