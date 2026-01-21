package com.lumariq.server.models

import kotlinx.serialization.Serializable

@Serializable
data class NoteCreateRequest(val title: String, val body: String)

@Serializable
data class NoteUpdateRequest(val title: String? = null, val body: String? = null)

@Serializable
data class NoteResponse(
    val id: Long,
    val title: String,
    val body: String,
    val createdAt: String
)
