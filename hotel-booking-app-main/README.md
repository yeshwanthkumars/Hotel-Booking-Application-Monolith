# Hotel Booking System - Spring Boot Backend

## Overview

This project is a Spring Boot 4 backend for hotel and room booking with JWT-based authentication and role-based authorization.

## Tech Stack

- Java 17
- Spring Boot 4.0.6
- Spring Data JPA + Hibernate
- Spring Security + JWT (jjwt)
- MySQL
- Springdoc OpenAPI / Swagger UI

## Current API Modules

- `AuthController` (`/api/auth`)
- `HotelController` (`/api/v1/hotels`)
- `RoomController` (`/api/v1/rooms`)
- `BookingController` (`/api/v1/bookings`)

> User-management CRUD endpoints are not part of the active API flow.

## Authentication

### Register

`POST /api/auth/register`

Request body:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "USER"
}
```

Response body:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "message": "Registered successfully",
  "token": null
}
```

### Login

`POST /api/auth/login`

Request body:

```json
{
  "username": "john_doe",
  "password": "Password@123"
}
```

Response body:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "message": "Logged in successfully",
  "token": "<jwt-token>"
}
```

## Authorization Summary

- `ADMIN`: full CRUD on hotel, room, booking endpoints
- `USER`: can search/view hotels and rooms, and create bookings
- All non-auth APIs require JWT Bearer token

## Swagger

- UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Run

```bash
mvn clean install
mvn spring-boot:run
```
