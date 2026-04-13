FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM eclipse-temurin:17-jdk-alpine AS backend
WORKDIR /src
COPY pom.xml .
COPY src ./src
COPY --from=frontend /src/main/resources/static ./src/main/resources/static
RUN apk add --no-cache maven && mvn clean package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
COPY --from=backend /src/target/messenger-1.0.0.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
