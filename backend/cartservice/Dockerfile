# Stage 1: Build with Maven
FROM maven:3.9.4-eclipse-temurin-17-alpine AS build

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK
FROM openjdk:17-jdk-slim

WORKDIR /app
# Đổi tên file jar phù hợp với service này
COPY --from=build /app/target/*.jar cartservice.jar

EXPOSE 9005
ENTRYPOINT ["java", "-jar", "cartservice.jar"]
