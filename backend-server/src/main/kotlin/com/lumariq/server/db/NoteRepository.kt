package com.lumariq.server.db

import com.lumariq.server.models.NoteCreateRequest
import com.lumariq.server.models.NoteUpdateRequest
import com.lumariq.server.models.NoteResponse
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import javax.sql.DataSource

class NoteRepository(private val ds: DataSource) {

    private fun rowToNote(
        id: Long,
        title: String,
        body: String,
        createdAt: OffsetDateTime
    ): NoteResponse {
        return NoteResponse(
            id = id,
            title = title,
            body = body,
            createdAt = createdAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
        )
    }

    fun create(req: NoteCreateRequest): NoteResponse {
        ds.connection.use { c ->
            c.prepareStatement(
                """
                INSERT INTO notes (title, body)
                VALUES (?, ?)
                RETURNING id, title, body, created_at
                """.trimIndent()
            ).use { ps ->
                ps.setString(1, req.title)
                ps.setString(2, req.body)
                ps.executeQuery().use { rs ->
                    rs.next()
                    return rowToNote(
                        id = rs.getLong("id"),
                        title = rs.getString("title"),
                        body = rs.getString("body"),
                        createdAt = rs.getObject("created_at", OffsetDateTime::class.java)
                    )
                }
            }
        }
    }

    fun list(limit: Int = 50): List<NoteResponse> {
        ds.connection.use { c ->
            c.prepareStatement(
                """
                SELECT id, title, body, created_at
                FROM notes
                ORDER BY id DESC
                LIMIT ?
                """.trimIndent()
            ).use { ps ->
                ps.setInt(1, limit.coerceIn(1, 200))
                ps.executeQuery().use { rs ->
                    val out = mutableListOf<NoteResponse>()
                    while (rs.next()) {
                        out += rowToNote(
                            id = rs.getLong("id"),
                            title = rs.getString("title"),
                            body = rs.getString("body"),
                            createdAt = rs.getObject("created_at", OffsetDateTime::class.java)
                        )
                    }
                    return out
                }
            }
        }
    }

    fun getById(id: Long): NoteResponse? {
        ds.connection.use { c ->
            c.prepareStatement(
                """
                SELECT id, title, body, created_at
                FROM notes
                WHERE id = ?
                """.trimIndent()
            ).use { ps ->
                ps.setLong(1, id)
                ps.executeQuery().use { rs ->
                    if (!rs.next()) return null
                    return rowToNote(
                        id = rs.getLong("id"),
                        title = rs.getString("title"),
                        body = rs.getString("body"),
                        createdAt = rs.getObject("created_at", OffsetDateTime::class.java)
                    )
                }
            }
        }
    }

    fun update(id: Long, req: NoteUpdateRequest): NoteResponse? {
        ds.connection.use { c ->
            c.prepareStatement(
                """
                UPDATE notes
                SET
                  title = COALESCE(?, title),
                  body  = COALESCE(?, body)
                WHERE id = ?
                RETURNING id, title, body, created_at
                """.trimIndent()
            ).use { ps ->
                ps.setString(1, req.title)
                ps.setString(2, req.body)
                ps.setLong(3, id)
                ps.executeQuery().use { rs ->
                    if (!rs.next()) return null
                    return rowToNote(
                        id = rs.getLong("id"),
                        title = rs.getString("title"),
                        body = rs.getString("body"),
                        createdAt = rs.getObject("created_at", OffsetDateTime::class.java)
                    )
                }
            }
        }
    }

    fun delete(id: Long): Boolean {
        ds.connection.use { c ->
            c.prepareStatement("DELETE FROM notes WHERE id = ?").use { ps ->
                ps.setLong(1, id)
                return ps.executeUpdate() > 0
            }
        }
    }
}
