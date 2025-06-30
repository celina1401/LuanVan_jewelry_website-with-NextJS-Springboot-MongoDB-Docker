# Stage 1: Build with Maven
FROM maven:3.9.4-eclipse-temurin-17-alpine AS build

WORKDIR /app
COPY . .                      
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK
FROM openjdk:17-jdk-slim

WORKDIR /app
COPY --from=build /app/target/*.jar discoveryserver.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "discoveryserver.jar"]
