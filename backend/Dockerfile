# Build image (Gradle)
FROM gradle:8.10.2-jdk21-alpine AS build
WORKDIR /app

# Cache dependencies separately from source
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon || true

COPY . .
RUN gradle bootJar --no-daemon

# Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
