# syntax=docker/dockerfile:1.7
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Cache Gradle between builds
ENV GRADLE_USER_HOME=/home/gradle/.gradle

# Copy only build files first (better caching)
COPY gradle gradle
COPY gradlew gradlew
COPY settings.gradle* build.gradle* gradle.properties* ./

# Pre-fetch deps (cached)
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew --no-daemon -q dependencies || true

# Now copy sources
COPY . .

# Build distribution (cached)
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew --no-daemon -q clean installDist

FROM eclipse-temurin:17-jre
WORKDIR /app

# Minimal tools for healthchecks/debug
RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Run as non-root
RUN useradd -m -u 10001 appuser
USER appuser

# App files
COPY --from=build /app/build/install/backend-server/ ./
COPY --from=build /app/build/resources/main/application.conf ./application.conf

# Sensible JVM defaults (can override via JAVA_OPTS env)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Dfile.encoding=UTF-8"

EXPOSE 8080
CMD ["sh","-lc","exec java -cp \"lib/*\" io.ktor.server.netty.EngineMain -config=/app/application.conf -port=${PORT:-8080}"]