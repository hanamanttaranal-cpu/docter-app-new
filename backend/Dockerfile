# Stage 1: Build Java Jar using Maven
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Downloader dependency cache
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create lightweight production JRE runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user for security hardening
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
