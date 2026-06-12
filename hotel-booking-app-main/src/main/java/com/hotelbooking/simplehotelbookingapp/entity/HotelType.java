package com.hotelbooking.simplehotelbookingapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Enum representing the classification/type of a hotel.
 */
public enum HotelType {
    BUDGET,
    LUXURY,
    BOUTIQUE,
    RESORT,
    BUSINESS;

    @JsonCreator
    public static HotelType fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return HotelType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid hotelType: '" + value + "'. Allowed values: BUDGET, LUXURY, BOUTIQUE, RESORT, BUSINESS");
        }
    }
}
