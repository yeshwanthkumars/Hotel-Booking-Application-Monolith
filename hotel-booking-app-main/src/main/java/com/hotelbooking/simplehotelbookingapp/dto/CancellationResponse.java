package com.hotelbooking.simplehotelbookingapp.dto;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
@Schema(description = "Response returned after a booking is successfully cancelled.")
public record CancellationResponse(
        @Schema(description = "Human-readable cancellation message", example = "Booking BK-A1B2C3D4 has been successfully cancelled.")
        String message,
        @Schema(description = "Booking database ID", example = "1")
        Long bookingId,
        @Schema(description = "Unique booking confirmation number", example = "BK-A1B2C3D4")
        String confirmationNumber,
        @Schema(description = "Updated booking status after cancellation", example = "CANCELLED")
        BookingStatus bookingStatus,
        @Schema(description = "Updated payment status after cancellation", example = "REFUNDED")
        PaymentStatus paymentStatus,
        @Schema(description = "Whether a refund was issued due to a prior PAID payment", example = "true")
        boolean refunded
) {
    public String getMessage()                  { return message; }
    public Long getBookingId()                  { return bookingId; }
    public String getConfirmationNumber()       { return confirmationNumber; }
    public BookingStatus getBookingStatus()     { return bookingStatus; }
    public PaymentStatus getPaymentStatus()     { return paymentStatus; }
    public boolean isRefunded()                 { return refunded; }
}