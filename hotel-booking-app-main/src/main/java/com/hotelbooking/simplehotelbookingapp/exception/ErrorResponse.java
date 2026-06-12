package com.hotelbooking.simplehotelbookingapp.exception;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ErrorResponse(
        int status,
        String code,
        String message,
        LocalDateTime timestamp,
        String traceId,
        List<Map<String, String>> fieldErrors
) {
    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getTraceId() {
        return traceId;
    }

    public List<Map<String, String>> getFieldErrors() {
        return fieldErrors;
    }
}

