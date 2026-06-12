package com.hotelbooking.simplehotelbookingapp.entity;
import com.fasterxml.jackson.annotation.JsonCreator;
/**
 * Payment method options for a mock hotel booking payment.
 */
public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    UPI,
    CASH;
    @JsonCreator
    public static PaymentMethod fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid paymentMethod: '" + value + "'. Allowed values: CREDIT_CARD, DEBIT_CARD, UPI, CASH");
        }
    }
}