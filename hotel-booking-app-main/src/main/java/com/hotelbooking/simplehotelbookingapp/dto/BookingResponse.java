package com.hotelbooking.simplehotelbookingapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Full booking details returned by the API.")
public record BookingResponse(
        @Schema(description = "Auto-generated booking ID", example = "1")
        Long id,

        @Schema(description = "Unique booking reference number", example = "BK-A1B2C3D4")
        String confirmationNumber,

        @Schema(description = "Full name of the guest", example = "Yeshwanth Kumar")
        String guestName,

        @Schema(description = "Guest email address", example = "guest@email.com")
        String guestEmail,

        @Schema(description = "Guest contact phone number", example = "+91-9876543210")
        String guestPhone,

        @Schema(description = "Number of guests", example = "2")
        Integer numberOfGuests,

        @Schema(description = "Check-in date (yyyy-MM-dd)", example = "2026-06-01")
        LocalDate checkInDate,

        @Schema(description = "Check-out date (yyyy-MM-dd)", example = "2026-06-05")
        LocalDate checkOutDate,

        @Schema(description = "Total price for the stay (room price × nights)", example = "600.00")
        BigDecimal totalPrice,

        @Schema(description = "Booking lifecycle status",
                example = "CONFIRMED",
                allowableValues = {"PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"})
        BookingStatus bookingStatus,

        @Schema(description = "Payment status",
                example = "PAID",
                allowableValues = {"PENDING", "PAID", "REFUNDED", "FAILED"})
        PaymentStatus paymentStatus,

        @Schema(description = "Special requests or preferences", example = "Non-smoking room, high floor preferred")
        String specialRequests,

        @Schema(description = "ID of the booked room", example = "1")
        Long roomId,

        @Schema(description = "Room number of the booked room", example = "101")
        String roomNumber,

        @Schema(description = "Room category of the booked room", example = "SUITE",
                allowableValues = {"SINGLE", "DOUBLE", "SUITE", "DELUXE", "FAMILY"})
        RoomType roomType,

        @Schema(description = "ID of the hotel the room belongs to", example = "1")
        Long hotelId,

        @Schema(description = "Name of the hotel the room belongs to", example = "Taj Hotel")
        String hotelName,

        @Schema(description = "ID of the user who made the booking", example = "1")
        Long userId,

        @Schema(description = "Booking creation timestamp (ISO-8601)", example = "2026-05-30T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @Schema(description = "Booking last-updated timestamp (ISO-8601)", example = "2026-05-30T12:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt

) {
    public Long getId()                         { return id; }
    public String getConfirmationNumber()       { return confirmationNumber; }
    public String getGuestName()                { return guestName; }
    public String getGuestEmail()               { return guestEmail; }
    public String getGuestPhone()               { return guestPhone; }
    public Integer getNumberOfGuests()          { return numberOfGuests; }
    public LocalDate getCheckInDate()           { return checkInDate; }
    public LocalDate getCheckOutDate()          { return checkOutDate; }
    public BigDecimal getTotalPrice()           { return totalPrice; }
    public BookingStatus getBookingStatus()     { return bookingStatus; }
    public PaymentStatus getPaymentStatus()     { return paymentStatus; }
    public String getSpecialRequests()          { return specialRequests; }
    public Long getRoomId()                     { return roomId; }
    public String getRoomNumber()               { return roomNumber; }
    public RoomType getRoomType()               { return roomType; }
    public Long getHotelId()                    { return hotelId; }
    public String getHotelName()                { return hotelName; }
    public Long getUserId()                     { return userId; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
    public LocalDateTime getUpdatedAt()         { return updatedAt; }
}
