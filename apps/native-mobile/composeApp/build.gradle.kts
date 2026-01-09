plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android") // Inherits version 1.9.23 from Root
}

android {
    namespace = "com.lumariq.android"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.lumariq.android"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        // ✅ NOW COMPATIBLE: Kotlin 1.9.23 <-> Compose 1.5.11
        kotlinCompilerExtensionVersion = "1.5.11"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlin {
        jvmToolchain(17)
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.compose.ui:ui-text-google-fonts:1.6.1")
    implementation("androidx.core:core-ktx:1.12.0")
    implementation(project(":shared"))
    debugImplementation("androidx.compose.ui:ui-tooling")
}
