package com.lumariq.server.routes

import com.lumariq.server.db.NoteRepository
import com.lumariq.server.models.ApiError
import com.lumariq.server.models.NoteCreateRequest
import com.lumariq.server.models.NoteUpdateRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.noteRoutes(repo: NoteRepository) {

    route("/notes") {

        get {
            call.respond(repo.list())
        }

        post {
            val req = call.receive<NoteCreateRequest>()
            call.respond(HttpStatusCode.Created, repo.create(req))
        }

        get("{id}") {
            val id = call.parameters["id"]?.toLongOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, ApiError("Invalid id"))

            val note = repo.getById(id)
                ?: return@get call.respond(HttpStatusCode.NotFound, ApiError("Note not found"))

            call.respond(note)
        }

        put("{id}") {
            val id = call.parameters["id"]?.toLongOrNull()
                ?: return@put call.respond(HttpStatusCode.BadRequest, ApiError("Invalid id"))

            val req = call.receive<NoteUpdateRequest>()
            if (req.title == null && req.body == null) {
                return@put call.respond(HttpStatusCode.BadRequest, ApiError("Nothing to update"))
            }

            val updated = repo.update(id, req)
                ?: return@put call.respond(HttpStatusCode.NotFound, ApiError("Note not found"))

            call.respond(updated)
        }

        delete("{id}") {
            val id = call.parameters["id"]?.toLongOrNull()
                ?: return@delete call.respond(HttpStatusCode.BadRequest, ApiError("Invalid id"))

            val ok = repo.delete(id)
            if (!ok) return@delete call.respond(HttpStatusCode.NotFound, ApiError("Note not found"))

            call.respond(HttpStatusCode.NoContent)
        }
    }
}
