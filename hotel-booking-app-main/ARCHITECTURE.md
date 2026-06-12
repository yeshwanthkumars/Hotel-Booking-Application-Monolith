# Hotel Booking System - Spring Boot Backend Architecture

## Overview

This is a comprehensive Spring Boot 4 backend application for a hotel booking system using layered architecture pattern with Spring Data JPA and MySQL.

## Project Structure

```
com.hotelbooking.simplehotelbookingapp/
├── entity/                  # JPA Entity classes
│   ├── User.java           # User/Guest entity
│   ├── Hotel.java          # Hotel entity
│   ├── Room.java           # Room entity
│   └── Booking.java        # Booking entity
├── dto/                     # Data Transfer Objects
│   ├── RegisterRequest.java
│   ├── AuthenticationRequest.java
│   ├── AuthenticationResponse.java
│   ├── HotelRequest.java
│   ├── HotelResponse.java
│   ├── RoomRequest.java
│   ├── RoomResponse.java
│   ├── BookingRequest.java
│   └── BookingResponse.java
├── repository/              # Spring Data JPA Repositories
│   ├── UserRepository.java
│   ├── HotelRepository.java
│   ├── RoomRepository.java
│   └── BookingRepository.java
├── service/                 # Business Logic Layer
│   ├── AuthenticationService.java
│   ├── HotelService.java
│   ├── RoomService.java
│   └── BookingService.java
├── controller/              # REST API Endpoints
│   ├── AuthController.java
│   ├── HotelController.java
│   ├── RoomController.java
│   └── BookingController.java
├── exception/               # Custom Exceptions & Handler
│   ├── ResourceNotFoundException.java
│   ├── RoomNotAvailableException.java
│   ├── BookingConflictException.java
│   ├── InvalidDateException.java
│   ├── ErrorResponse.java
│   └── GlobalExceptionHandler.java
└── SimpleHotelBookingAppApplication.java  # Main Application
```

## Entity Relationships

### Database Schema

```
┌─────────────┐         ┌──────────┐         ┌───────────┐
│   USER      │─────────│ BOOKING  │─────────│   ROOM    │
└─────────────┘ 1:N     └──────────┘ N:1     └───────────┘
                                                    │
                                                    │ N:1
                                              ┌──────────┐
                                              │  HOTEL   │
                                              └──────────┘
```

### Entity Details

#### User Entity
- **Table**: `users`
- **Fields**:
  - `id` (Primary Key)
  - `firstName`, `lastName`, `email` (unique), `phoneNumber`
- **Relationships**: One-to-Many with Booking

#### Hotel Entity
- **Table**: `hotels`
- **Fields**:
  - `id` (Primary Key)
  - `name`, `address`, `city`, `state`, `country`, `postalCode`
  - `phoneNumber`, `email`, `description`
  - `starRating` (1-5), `latitude`, `longitude`
  - `createdAt`, `updatedAt` (Auto-managed)
- **Relationships**: One-to-Many with Room

#### Room Entity
- **Table**: `rooms`
- **Fields**:
  - `id` (Primary Key)
  - `roomNumber`, `roomType` (Single, Double, Suite, etc.)
  - `capacity`, `pricePerNight` (BigDecimal)
  - `description`, `amenities`
  - `isAvailable` (boolean), `status`
  - `createdAt`, `updatedAt` (Auto-managed)
- **Relationships**: Many-to-One with Hotel, One-to-Many with Booking

#### Booking Entity
- **Table**: `bookings`
- **Fields**:
  - `id` (Primary Key)
  - `checkInDate`, `checkOutDate` (LocalDate)
  - `status` (PENDING, CONFIRMED, CANCELLED, COMPLETED)
  - `totalPrice` (BigDecimal)
  - `numberOfGuests`, `specialRequests`
  - `createdAt`, `updatedAt` (Auto-managed)
- **Relationships**: Many-to-One with User, Many-to-One with Room
- **Methods**:
  - `isValid()`: Validates check-out date is after check-in date
  - `getNumberOfNights()`: Calculates nights between check-in and check-out

## API Endpoints

### Authentication
```
POST   /api/auth/register              # Register user (username, email, password, role)
POST   /api/auth/login                 # Login and get JWT token
```

### Hotel Management
```
POST   /api/v1/hotels                           # Create hotel
GET    /api/v1/hotels                           # Get all hotels
GET    /api/v1/hotels/{id}                      # Get hotel by ID
GET    /api/v1/hotels/name/{name}               # Get hotel by name
GET    /api/v1/hotels/city/{city}               # Get hotels by city
GET    /api/v1/hotels/state/{state}             # Get hotels by state
GET    /api/v1/hotels/country/{country}         # Get hotels by country
GET    /api/v1/hotels/search/city-rating?city=X&minRating=Y  # Search by city & rating
PUT    /api/v1/hotels/{id}                      # Update hotel
DELETE /api/v1/hotels/{id}                      # Delete hotel
```

### Room Management
```
POST   /api/v1/rooms                                          # Create room
GET    /api/v1/rooms                                          # Get all rooms
GET    /api/v1/rooms/{id}                                     # Get room by ID
GET    /api/v1/rooms/hotel/{hotelId}                          # Get rooms by hotel
GET    /api/v1/rooms/hotel/{hotelId}/available                # Get available rooms
GET    /api/v1/rooms/hotel/{hotelId}/available-by-capacity?capacity=X  # Get by capacity
GET    /api/v1/rooms/hotel/{hotelId}/available-by-date-range?checkInDate=X&checkOutDate=Y  # Availability by date
PUT    /api/v1/rooms/{id}                                     # Update room
PATCH  /api/v1/rooms/{id}/availability?isAvailable=true      # Toggle room availability
DELETE /api/v1/rooms/{id}                                     # Delete room
```

### Booking Management
```
POST   /api/v1/bookings                      # Create booking
GET    /api/v1/bookings                      # Get all bookings
GET    /api/v1/bookings/{id}                 # Get booking by ID
GET    /api/v1/bookings/user/{userId}        # Get bookings by user
GET    /api/v1/bookings/room/{roomId}        # Get bookings by room
GET    /api/v1/bookings/status/{status}      # Get bookings by status
PUT    /api/v1/bookings/{id}                 # Update booking
PATCH  /api/v1/bookings/{id}/status?status=X # Update booking status
POST   /api/v1/bookings/{id}/cancel          # Cancel booking
DELETE /api/v1/bookings/{id}                 # Delete booking
```

## Layered Architecture Components

### 1. Controller Layer (`@RestController`)
- Handles HTTP requests and responses
- Input validation using `@Valid` annotation
- Delegates business logic to service layer
- Returns appropriate HTTP status codes
- Cross-origin support with `@CrossOrigin`

### 2. Service Layer (`@Service`)
- Contains core business logic
- Handles data transformation (Entity ↔ DTO)
- Implements transaction management (`@Transactional`)
- Validates business rules
- Manages conflicts and availability checks

### 3. Repository Layer (`@Repository`)
- Extends `JpaRepository` for CRUD operations
- Custom query methods using `@Query` annotation
- Advanced filtering and searching capabilities
- Database access abstraction

### 4. DTO Layer
- **Request DTOs**: Validate and receive client input
- **Response DTOs**: Format and send server responses
- Separates API contract from entity structure
- Bean Validation annotations (`jakarta.validation`)

### 5. Entity Layer
- JPA entities mapped to database tables
- Proper annotations: `@Entity`, `@Table`, `@Column`
- Relationships: `@OneToMany`, `@ManyToOne`, `@JoinColumn`
- Validation constraints
- Lifecycle methods: `@PreUpdate`

### 6. Exception Layer
- Custom exception classes for specific scenarios
- Global exception handler using `@RestControllerAdvice`
- Consistent error responses with `ErrorResponse` class
- Proper HTTP status code mapping

## Key Features

### Business Logic
✅ **Room Availability Management**
- Check room availability for specific date ranges
- Conflict detection with existing bookings
- Capacity-based filtering

✅ **Booking Management**
- Automatic total price calculation
- Date validation (check-out > check-in)
- Prevent past date bookings
- Support for booking status workflow (PENDING → CONFIRMED → COMPLETED)

✅ **Hotel Search**
- Search by city, state, country
- Filter by star rating
- Combined filters (city + rating)

✅ **Data Validation**
- Bean validation on DTOs
- Business logic validation in service layer
- Constraint-based database validation

### Database
✅ **MySQL Integration**
- Spring Data JPA with Hibernate ORM
- Auto DDL management (`ddl-auto: update`)
- Proper data types and constraints
- Indexed columns for performance

✅ **Temporal Data**
- Automatic `createdAt` and `updatedAt` management
- `@PreUpdate` annotation for timestamp updates

## Configuration

### Database Connection (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

## Custom Exceptions

| Exception | Scenario | HTTP Status |
|-----------|----------|-------------|
| `ResourceNotFoundException` | Entity not found | 404 NOT_FOUND |
| `RoomNotAvailableException` | No available rooms | 409 CONFLICT |
| `BookingConflictException` | Booking dates conflict | 409 CONFLICT |
| `InvalidDateException` | Check-out ≤ check-in | 400 BAD_REQUEST |
| `MethodArgumentNotValidException` | Validation failed | 400 BAD_REQUEST |
| Generic `Exception` | Unexpected error | 500 INTERNAL_SERVER_ERROR |

## Usage Examples

### Create Hotel
```bash
curl -X POST http://localhost:8080/api/v1/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Hotel",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "phoneNumber": "2125551234",
    "email": "contact@hotel.com",
    "description": "5-star luxury hotel",
    "starRating": 5,
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Create Room
```bash
curl -X POST http://localhost:8080/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "roomType": "Deluxe",
    "capacity": 2,
    "pricePerNight": 200.00,
    "description": "Spacious deluxe room with city view",
    "status": "AVAILABLE",
    "amenities": "WiFi, AC, Minibar",
    "hotelId": 1
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:8080/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "checkInDate": "2026-05-15",
    "checkOutDate": "2026-05-18",
    "numberOfGuests": 2,
    "specialRequests": "High floor preferred",
    "userId": 1,
    "roomId": 1
  }'
```

## Transaction Management

All service methods are marked with `@Transactional` for:
- ACID compliance
- Automatic rollback on exceptions
- Consistent state management

## Performance Considerations

✅ **Lazy Loading**: Foreign key relationships use `FetchType.LAZY`
✅ **Custom Queries**: Optimized `@Query` methods for complex searches
✅ **Cascade Operations**: Cascading deletes for related entities
✅ **JPA Naming Strategy**: Consistent naming conventions

## Future Enhancements

- [x] JWT authentication and authorization
- [ ] Rate limiting API endpoints
- [ ] Pagination for list endpoints
- [ ] Search filters (price range, amenities)
- [ ] Payment integration
- [ ] Email notifications
- [ ] Review and rating system
- [ ] Discount/promotion codes
- [ ] Loyalty program
- [ ] Analytics and reporting

## Running the Application

1. **Create MySQL Database**
```sql
CREATE DATABASE hotel_booking_db;
```

2. **Configure Database Credentials**
Edit `application.properties` with your MySQL credentials.

3. **Build Project**
```bash
mvn clean build
```

4. **Run Application**
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

All endpoints return JSON responses. The API is RESTful and follows standard HTTP conventions:
- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources

## Error Handling

All errors follow consistent format:
```json
{
  "status": 400,
  "message": "Error description",
  "timestamp": "2026-04-29T10:15:30"
}
```

## Authentication Response Contracts

### Register (`POST /api/auth/register`)

Response fields:
- `username`
- `email`
- `role`
- `message`

### Login (`POST /api/auth/login`)

Response fields:
- `username`
- `email`
- `role`
- `message`
- `token`



