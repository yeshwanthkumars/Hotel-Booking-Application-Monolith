package com.hotelbooking.simplehotelbookingapp.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentMethod;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Schema(description = "Response returned after a mock payment is processed or refunded.")
public record PaymentResponse(
        @Schema(description = "Mock transaction reference number", example = "TXN-A1B2C3D4")
        String transactionId,
        @Schema(description = "Booking ID the payment belongs to", example = "1")
        Long bookingId,
        @Schema(description = "Unique booking confirmation number", example = "BK-A1B2C3D4")
        String confirmationNumber,
        @Schema(description = "Payment method used", example = "CREDIT_CARD",
                allowableValues = {"CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"})
        PaymentMethod paymentMethod,
        @Schema(description = "Amount paid or refunded", example = "600.00")
        BigDecimal amount,
        @Schema(description = "Updated payment status", example = "PAID",
                allowableValues = {"PENDING", "PAID", "REFUNDED", "FAILED"})
        PaymentStatus paymentStatus,
        @Schema(description = "Updated booking status", example = "CONFIRMED",
                allowableValues = {"PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"})
        BookingStatus bookingStatus,
        @Schema(description = "Timestamp when the payment was processed (ISO-8601)", example = "2026-05-30T10:15:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime processedAt
) {
    public String getTransactionId()        { return transactionId; }
    public Long getBookingId()              { return bookingId; }
    public String getConfirmationNumber()   { return confirmationNumber; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public BigDecimal getAmount()           { return amount; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public LocalDateTime getProcessedAt()   { return processedAt; }
}