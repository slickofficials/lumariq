package com.lumariq.server.models

import kotlinx.serialization.Serializable

@Serializable
data class ApiError(val error: String)
