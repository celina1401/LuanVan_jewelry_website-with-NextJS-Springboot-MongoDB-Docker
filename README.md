# Full Stack Application with Next.js, Spring Boot, MongoDB, and Docker

This project is a full-stack application that uses Next.js for the frontend, Spring Boot for the backend, MongoDB for the database, and Docker for containerization.

## Features

- User authentication with JWT
- RESTful API
- Responsive UI built with Next.js, Tailwind CSS, and shadcn/ui
- MongoDB data persistence
- Docker containerization for easy deployment

## Tech Stack

### Frontend
- Next.js 13.5.1
- Tailwind CSS
- shadcn/ui components
- TypeScript
- React Hook Form
- Lucide Icons

### Backend
- Spring Boot 3.1.5
- Spring Security
- JWT Authentication
- Spring Data MongoDB
- Swagger/OpenAPI for API documentation

### Database
- MongoDB

### DevOps
- Docker
- Docker Compose

## Project Structure

```
.
├── app/                    # Next.js application files
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── backend/                # Spring Boot application
│   ├── src/                # Java source code
│   ├── pom.xml             # Maven dependencies
│   └── Dockerfile          # Backend Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile.frontend     # Frontend Docker configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed

### Running the Application

1. Clone the repository
2. Run the application using Docker Compose:

```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/swagger-ui.html

## Development

### Frontend Development

```bash
npm install
npm run dev
```

### Backend Development

```bash
cd backend
./mvnw spring-boot:run
```

## API Documentation

The API documentation is available through Swagger UI at http://localhost:8080/swagger-ui.html when the application is running.

## Authentication

The application uses JWT for authentication. To access protected endpoints, you need to:

1. Register a new user at `/register`
2. Log in at `/login` to get a JWT token
3. Include the token in the Authorization header for subsequent requests

## License

This project is licensed under the MIT License.