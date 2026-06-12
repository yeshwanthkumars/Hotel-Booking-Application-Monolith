package com.hotelbooking.simplehotelbookingapp.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import io.micrometer.core.instrument.MeterRegistry;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String TRACE_ID_KEY = "traceId";
    private final MeterRegistry meterRegistry;

    public GlobalExceptionHandler(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String code, String message) {
        return buildResponse(status, code, message, Collections.emptyList());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status,
                                                        String code,
                                                        String message,
                                                        List<Map<String, String>> fieldErrors) {
        ErrorResponse errorResponse = new ErrorResponse(
                status.value(),
                code,
                message,
                LocalDateTime.now(),
                MDC.get(TRACE_ID_KEY),
                fieldErrors
        );
        return new ResponseEntity<>(errorResponse, status);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(RoomNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleRoomNotAvailableException(RoomNotAvailableException ex) {
        return buildResponse(HttpStatus.CONFLICT, "ROOM_NOT_AVAILABLE", ex.getMessage());
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ErrorResponse> handleBookingConflictException(BookingConflictException ex) {
        return buildResponse(HttpStatus.CONFLICT, "BOOKING_CONFLICT", ex.getMessage());
    }

    @ExceptionHandler(InvalidDateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidDateException(InvalidDateException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_DATE", ex.getMessage());
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        return buildResponse(HttpStatus.CONFLICT, "USER_ALREADY_EXISTS", ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        meterRegistry.counter("auth.failures.total", "reason", "bad_credentials").increment();
        return buildResponse(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", ex.getMessage());
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwtException(ExpiredJwtException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "JWT_EXPIRED", "JWT token has expired");
    }

    @ExceptionHandler({AuthenticationException.class, AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleSecurityException(Exception ex) {
        HttpStatus status = ex instanceof AccessDeniedException ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED;
        String message = ex instanceof AccessDeniedException ? "Access denied" : "Unauthorized access";
        String code = ex instanceof AccessDeniedException ? "ACCESS_DENIED" : "UNAUTHORIZED";
        return buildResponse(status, code, message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        meterRegistry.counter("http.validation.errors.total").increment();

        List<Map<String, String>> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of(
                        "field", error.getField(),
                        "message", error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage()
                ))
                .toList();

        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "Validation failed", fieldErrors);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(NoResourceFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", "Resource not found: " + ex.getMessage());
    }

    /**
     * Handles malformed JSON request bodies including:
     * - Invalid enum value  → "Invalid value 'XYZ' for field 'hotelType'. Allowed: BUDGET, LUXURY, ..."
     * - Unreadable JSON     → "Request body is malformed or missing."
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife && ife.getTargetType() != null
                && ife.getTargetType().isEnum()) {
            String fieldPath = ife.getPath().isEmpty() ? "unknown"
                    : ife.getPath().get(ife.getPath().size() - 1).getFieldName();
            String badValue  = String.valueOf(ife.getValue());
            String allowed   = Arrays.stream(ife.getTargetType().getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));
            String message = String.format(
                    "Invalid value '%s' for field '%s'. Allowed values: %s.", badValue, fieldPath, allowed);
            return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_ENUM_VALUE", message);
        }
        return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_REQUEST_BODY",
                "Request body is malformed or missing. Please check the JSON format and field types.");
    }

    /**
     * Handles invalid enum values passed as query parameters.
     * Example: GET /rooms?roomType=INVALID → "Invalid value 'INVALID' for parameter 'roomType'. Allowed: ..."
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String paramName = ex.getName();
        String badValue  = String.valueOf(ex.getValue());
        Class<?> requiredType = ex.getRequiredType();

        if (requiredType != null && requiredType.isEnum()) {
            String allowed = Arrays.stream(requiredType.getEnumConstants())
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));
            String message = String.format(
                    "Invalid value '%s' for parameter '%s'. Allowed values: %s.", badValue, paramName, allowed);
            return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_ENUM_VALUE", message);
        }
        String message = String.format("Invalid value '%s' for parameter '%s'.", badValue, paramName);
        return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_PARAMETER", message);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
        return buildResponse(HttpStatus.CONFLICT, "INVALID_STATE", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        meterRegistry.counter("http.server.errors.total").increment();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred: " + ex.getMessage());
    }
}

