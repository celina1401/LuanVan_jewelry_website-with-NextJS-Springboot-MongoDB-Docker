# Stage 1: Build with Maven
FROM maven:3.9.4-eclipse-temurin-17-alpine AS build

WORKDIR /app
COPY . .                                  
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK
FROM openjdk:17-jdk-slim

WORKDIR /app
COPY --from=build /app/target/*.jar paymentservice.jar
EXPOSE 9006
ENTRYPOINT ["java", "-jar", "paymentservice.jar"]