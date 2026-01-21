plugins {
    // ⚡ MASTER VERSION LOCK: Kotlin 1.9.23 (Unified)
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
    id("org.jetbrains.kotlin.multiplatform") version "1.9.23" apply false
    id("com.android.application") version "8.2.0" apply false
    id("com.android.library") version "8.2.0" apply false
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
}
