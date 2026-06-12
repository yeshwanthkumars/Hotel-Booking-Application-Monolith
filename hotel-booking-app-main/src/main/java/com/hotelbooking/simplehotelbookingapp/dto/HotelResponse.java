package com.hotelbooking.simplehotelbookingapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Full hotel details returned by the API.")
public record HotelResponse(

        @Schema(description = "Auto-generated hotel ID", example = "1")
        Long id,

        @Schema(description = "Hotel name", example = "Taj Hotel")
        String name,

        @Schema(description = "General location / area", example = "Mumbai")
        String location,

        @Schema(description = "Short marketing description", example = "An iconic luxury hotel overlooking the Gateway of India.")
        String description,

        @Schema(description = "Full street address", example = "Apollo Bunder, Colaba")
        String address,

        @Schema(description = "City", example = "Mumbai")
        String city,

        @Schema(description = "State or province", example = "Maharashtra")
        String state,

        @Schema(description = "Country", example = "India")
        String country,

        @Schema(description = "Hotel contact phone", example = "+91-22-6665-3366")
        String phoneNumber,

        @Schema(description = "Hotel contact email", example = "info@tajhotels.com")
        String email,

        @Schema(description = "Star rating (1–5)", example = "5")
        Integer starRating,

        @Schema(description = "Hotel classification", example = "LUXURY",
                allowableValues = {"BUDGET", "LUXURY", "BOUTIQUE", "RESORT", "BUSINESS"})
        HotelType hotelType,

        @Schema(description = "Check-in time in HH:mm format", example = "14:00")
        String checkInTime,

        @Schema(description = "Check-out time in HH:mm format", example = "11:00")
        String checkOutTime,

        @Schema(description = "True if a hotel image has been uploaded. Use GET /api/v1/hotels/{id}/image as <img src> to display it.",
                example = "true")
        Boolean hasImage,

        @Schema(description = "List of amenities", example = "[\"Free WiFi\", \"Pool\", \"Spa\"]")
        List<String> amenities,

        @Schema(description = "Whether the hotel is active and visible to users", example = "true")
        Boolean isActive,

        @Schema(description = "Timestamp when the hotel record was created (ISO-8601)", example = "2026-05-30T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @Schema(description = "Timestamp when the hotel record was last updated (ISO-8601)", example = "2026-05-30T12:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt

) {
    public Long getId()              { return id; }
    public String getName()          { return name; }
    public String getLocation()      { return location; }
    public String getDescription()   { return description; }
    public String getAddress()       { return address; }
    public String getCity()          { return city; }
    public String getState()         { return state; }
    public String getCountry()       { return country; }
    public String getPhoneNumber()   { return phoneNumber; }
    public String getEmail()         { return email; }
    public Integer getStarRating()   { return starRating; }
    public HotelType getHotelType()  { return hotelType; }
    public String getCheckInTime()   { return checkInTime; }
    public String getCheckOutTime()  { return checkOutTime; }
    public Boolean getHasImage()         { return hasImage; }
    public List<String> getAmenities()   { return amenities; }
    public Boolean getIsActive()         { return isActive; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }
}
