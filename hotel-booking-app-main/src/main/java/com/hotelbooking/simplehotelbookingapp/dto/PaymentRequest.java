package com.hotelbooking.simplehotelbookingapp.dto;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
@Schema(description = "Request body to process a mock payment for an existing booking.")
public record PaymentRequest(
        @Schema(description = "ID of the booking to pay for", example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Booking ID is required")
        Long bookingId,
        @Schema(description = "Payment method. Allowed: CREDIT_CARD, DEBIT_CARD, UPI, CASH", example = "CREDIT_CARD",
                allowableValues = {"CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"},
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        @Schema(description = "Amount to pay. Must match the booking total price.", example = "600.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount
) {
    public Long getBookingId()              { return bookingId; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public BigDecimal getAmount()           { return amount; }
}