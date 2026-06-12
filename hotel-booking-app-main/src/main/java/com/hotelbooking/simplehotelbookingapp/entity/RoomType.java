package com.hotelbooking.simplehotelbookingapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Classification of a hotel room by category.
 */
public enum RoomType {
    SINGLE, DOUBLE, SUITE, DELUXE, FAMILY;

    @JsonCreator
    public static RoomType fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return RoomType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid roomType: '" + value + "'. Allowed values: SINGLE, DOUBLE, SUITE, DELUXE, FAMILY");
        }
    }
}
