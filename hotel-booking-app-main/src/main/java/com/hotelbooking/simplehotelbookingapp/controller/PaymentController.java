package com.hotelbooking.simplehotelbookingapp.controller;
import com.hotelbooking.simplehotelbookingapp.dto.PaymentRequest;
import com.hotelbooking.simplehotelbookingapp.dto.PaymentResponse;
import com.hotelbooking.simplehotelbookingapp.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management",
        description = "Mock payment APIs for processing and refunding hotel room booking payments. " +
                "No real payment gateway is involved — all transactions are simulated.")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {
    private final PaymentService paymentService;
    // ─────────────────────────────────────────────────────────────────────────
    // PROCESS PAYMENT
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Process a mock payment",
            description = "Processes a mock payment for a PENDING booking. " +
                    "The amount must match the booking total price. " +
                    "On success, bookingStatus becomes CONFIRMED and paymentStatus becomes PAID. " +
                    "Returns a mock transactionId (e.g. TXN-A1B2C3D4).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed or amount mismatch", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Booking is already paid or refunded", content = @Content)
    })
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest paymentRequest) {
        return ResponseEntity.ok(paymentService.processPayment(paymentRequest));
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REFUND PAYMENT
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/refund/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Refund a mock payment",
            description = "Refunds the payment for a PAID booking. " +
                    "On success, bookingStatus becomes CANCELLED and paymentStatus becomes REFUNDED. " +
                    "Only ADMIN can issue refunds.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Refund processed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Booking is not in PAID status", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<PaymentResponse> refundPayment(
            @Parameter(description = "Booking database ID", example = "1", required = true)
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.refundPayment(bookingId));
    }
}