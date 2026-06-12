package com.hotelbooking.simplehotelbookingapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Payment status for a hotel booking.
 */
public enum PaymentStatus {
    /** Payment has not been collected yet. */
    PENDING,
    /** Payment was collected successfully. */
    PAID,
    /** Payment was refunded after cancellation. */
    REFUNDED,
    /** Payment attempt failed. */
    FAILED;

    @JsonCreator
    public static PaymentStatus fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return PaymentStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid paymentStatus: '" + value + "'. Allowed values: PENDING, PAID, REFUNDED, FAILED");
        }
    }
}
