package com.hotelbooking.simplehotelbookingapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Lifecycle status of a hotel booking.
 */
public enum BookingStatus {
    /** Booking has been submitted but not yet confirmed by the hotel. */
    PENDING,
    /** Booking is confirmed and the room is reserved. */
    CONFIRMED,
    /** Booking was cancelled by the guest or admin. */
    CANCELLED,
    /** Guest has checked out — stay is complete. */
    COMPLETED,
    /** Guest never arrived (no-show). */
    NO_SHOW;

    @JsonCreator
    public static BookingStatus fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return BookingStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid bookingStatus: '" + value + "'. Allowed values: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW");
        }
    }
}
