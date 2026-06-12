package com.hotelbooking.simplehotelbookingapp.dto;

import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Request body for creating or updating a booking. guestName, checkInDate, checkOutDate and roomId are required.")
public record BookingRequest(
        @Schema(description = "Full name of the guest", example = "Yeshwanth Kumar",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Guest name is required")
        String guestName,

        @Schema(description = "Check-in date (ISO-8601: yyyy-MM-dd)", example = "2026-06-01",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Check-in date is required")
        LocalDate checkInDate,

        @Schema(description = "Check-out date (ISO-8601: yyyy-MM-dd). Must be after checkInDate.", example = "2026-06-05",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Check-out date is required")
        LocalDate checkOutDate,

        @Schema(description = "ID of the room to book", example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Room ID is required")
        Long roomId,

        @Schema(description = "Guest email address for booking confirmation", example = "guest@email.com")
        @Email(message = "Guest email must be valid")
        String guestEmail,

        @Schema(description = "Guest contact phone number", example = "+91-9876543210")
        String guestPhone,

        @Schema(description = "Number of guests staying (minimum 1)", example = "2")
        @Min(value = 1, message = "Number of guests must be at least 1")
        Integer numberOfGuests,

        @Schema(description = "Any special requests or preferences", example = "Non-smoking room, high floor preferred")
        String specialRequests,

        @Schema(description = "Booking lifecycle status. Allowed: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW. " +
                "Defaults to PENDING on create.",
                example = "CONFIRMED",
                allowableValues = {"PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"})
        BookingStatus bookingStatus,

        @Schema(description = "Payment status. Allowed: PENDING, PAID, REFUNDED, FAILED. Defaults to PENDING on create.",
                example = "PAID",
                allowableValues = {"PENDING", "PAID", "REFUNDED", "FAILED"})
        PaymentStatus paymentStatus

) {
    public String getGuestName()         { return guestName; }
    public LocalDate getCheckInDate()    { return checkInDate; }
    public LocalDate getCheckOutDate()   { return checkOutDate; }
    public Long getRoomId()              { return roomId; }
    public String getGuestEmail()        { return guestEmail; }
    public String getGuestPhone()        { return guestPhone; }
    public Integer getNumberOfGuests()   { return numberOfGuests; }
    public String getSpecialRequests()   { return specialRequests; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
}
