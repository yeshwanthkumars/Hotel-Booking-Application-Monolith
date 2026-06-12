package com.hotelbooking.simplehotelbookingapp.security;

import com.hotelbooking.simplehotelbookingapp.exception.ErrorResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String TRACE_ID_KEY = "traceId";

    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        Throwable cause = (Throwable) request.getAttribute("authException");
        String message = "Unauthorized access";

        if (cause instanceof ExpiredJwtException) {
            message = "JWT token has expired";
        } else if (cause != null && cause.getMessage() != null && !cause.getMessage().isBlank()) {
            message = cause.getMessage();
        } else if (authException.getMessage() != null && !authException.getMessage().isBlank()) {
            message = authException.getMessage();
        }

        String reason = cause instanceof ExpiredJwtException ? "jwt_expired" : "unauthorized";
        meterRegistry.counter("auth.failures.total", "reason", reason).increment();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "UNAUTHORIZED",
                message,
                LocalDateTime.now(),
                MDC.get(TRACE_ID_KEY),
                Collections.emptyList()
        );
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}


