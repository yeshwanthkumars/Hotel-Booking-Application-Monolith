package com.hotelbooking.simplehotelbookingapp.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RoomStatus {
    AVAILABLE, BOOKED, MAINTENANCE, OUT_OF_SERVICE;

    @JsonCreator
    public static RoomStatus fromValue(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return RoomStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid roomStatus: '" + value + "'. Allowed values: AVAILABLE, BOOKED, MAINTENANCE, OUT_OF_SERVICE");
        }
    }
}
