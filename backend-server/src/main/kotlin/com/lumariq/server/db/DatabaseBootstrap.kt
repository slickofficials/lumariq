package com.lumariq.server.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.flywaydb.core.Flyway
import java.util.Properties

object DatabaseBootstrap {
    @Volatile private var started = false

    lateinit var ds: HikariDataSource
        private set

    fun init(): HikariDataSource {
        if (started) return ds

        val env = System.getenv()
        val host = env["LUMARIQ_DB_HOST"] ?: "127.0.0.1"
        val port = env["LUMARIQ_DB_PORT"] ?: "5432"
        val db   = env["LUMARIQ_DB_NAME"] ?: "dispatch"
        val user = env["LUMARIQ_DB_USER"] ?: "lumariq"
        val pass = env["LUMARIQ_DB_PASS"] ?: "lumariq"

        val jdbcUrl = "jdbc:postgresql://$host:$port/$db"
        println("🔌 DB: $jdbcUrl (user=$user)")

        val cfg = HikariConfig(Properties().apply {
            put("jdbcUrl", jdbcUrl)
            put("username", user)
            put("password", pass)
            put("maximumPoolSize", "10")
            put("connectionTimeout", "5000")
        })

        ds = HikariDataSource(cfg)

        Flyway.configure()
            .dataSource(ds)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .load()
            .migrate()

        started = true
        println("✅ DB Connected + Migrated")
        return ds
    }
}
