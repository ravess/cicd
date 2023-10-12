# Use an OpenJDK base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file from the local machine to the container
COPY /src/a1/target/*.jar /app/tmsapp.jar

RUN adduser -u 1100 --disabled-password dockerbuilder

USER dockerbuilder

# Expose the port that the Spring Boot application listens on
EXPOSE 8080

# Command to run the Spring Boot application
CMD ["java", "-jar", "tmsapp.jar"]