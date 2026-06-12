package com.hotelbooking.simplehotelbookingapp.ai.dto;

import com.hotelbooking.simplehotelbookingapp.dto.HotelResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RoomResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "AI search response — matched hotels and, when dates were provided, available rooms.")
public record AiSearchResponse(

        @Schema(description = "Original user query", example = "Hotels in Mumbai under ₹5000 from June 10 to June 15")
        String query,

        @Schema(description = "Hotels matching the extracted criteria (location, city, name, star rating).")
        List<HotelResponse> hotels,

        @Schema(description = "Available rooms for the extracted date range. " +
                "Only populated when check-in and check-out dates were found in the query.")
        List<RoomResponse> availableRooms,

        @Schema(description = "True when check-in/check-out dates were extracted and availability was checked.",
                example = "true")
        boolean availabilitySearch,

        @Schema(description = "Total number of hotels matched.", example = "3")
        int totalHotels,

        @Schema(description = "Total number of available rooms matched.", example = "5")
        int totalAvailableRooms

) {}

