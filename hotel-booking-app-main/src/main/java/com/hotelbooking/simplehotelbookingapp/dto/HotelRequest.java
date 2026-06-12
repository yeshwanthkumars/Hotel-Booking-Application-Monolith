package com.hotelbooking.simplehotelbookingapp.dto;

import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Schema(description = "Request body for creating or updating a hotel. Only name and location are required.")
public record HotelRequest(

        @Schema(description = "Hotel name", example = "Taj Hotel", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Hotel name is required")
        String name,

        @Schema(description = "General location / area of the hotel", example = "Mumbai", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Location is required")
        String location,

        @Schema(description = "Short marketing description (max 500 chars)", example = "An iconic luxury hotel overlooking the Gateway of India.")
        String description,

        @Schema(description = "Full street address", example = "Apollo Bunder, Colaba")
        String address,

        @Schema(description = "City where the hotel is located", example = "Mumbai")
        String city,

        @Schema(description = "State or province", example = "Maharashtra")
        String state,

        @Schema(description = "Country (full name or ISO code)", example = "India")
        String country,

        @Schema(description = "Hotel contact phone number", example = "+91-22-6665-3366")
        String phoneNumber,

        @Schema(description = "Hotel contact email address", example = "info@tajhotels.com")
        @Email(message = "Invalid email format")
        String email,

        @Schema(description = "Star rating from 1 (budget) to 5 (luxury)", example = "5", minimum = "1", maximum = "5")
        @Min(value = 1, message = "Star rating must be between 1 and 5")
        @Max(value = 5, message = "Star rating must be between 1 and 5")
        Integer starRating,

        @Schema(description = "Hotel classification. Allowed values: BUDGET, LUXURY, BOUTIQUE, RESORT, BUSINESS",
                example = "LUXURY", allowableValues = {"BUDGET", "LUXURY", "BOUTIQUE", "RESORT", "BUSINESS"})
        HotelType hotelType,

        @Schema(description = "Hotel check-in time in HH:mm format (24-hour clock)", example = "14:00")
        String checkInTime,

        @Schema(description = "Hotel check-out time in HH:mm format (24-hour clock)", example = "11:00")
        String checkOutTime,

        @Schema(description = "Base64-encoded image bytes. Use this field only for programmatic uploads. " +
                "For UI uploads use the dedicated POST /{id}/image endpoint instead.",
                example = "/9j/4AAQSkZJRgAB...")
        String imageBase64,

        @Schema(description = "MIME type of the image provided in imageBase64. Required when imageBase64 is set.",
                example = "image/jpeg", allowableValues = {"image/jpeg", "image/png", "image/webp", "image/gif"})
        String imageContentType,

        @Schema(description = "List of amenities offered by the hotel",
                example = "[\"Free WiFi\", \"Swimming Pool\", \"Spa\", \"Gym\", \"Restaurant\"]")
        List<String> amenities,

        @Schema(description = "Whether the hotel is active and visible to users. Defaults to true if omitted.", example = "true")
        Boolean isActive

) {
    public String getName()              { return name; }
    public String getLocation()          { return location; }
    public String getDescription()       { return description; }
    public String getAddress()           { return address; }
    public String getCity()              { return city; }
    public String getState()             { return state; }
    public String getCountry()           { return country; }
    public String getPhoneNumber()       { return phoneNumber; }
    public String getEmail()             { return email; }
    public Integer getStarRating()       { return starRating; }
    public HotelType getHotelType()      { return hotelType; }
    public String getCheckInTime()       { return checkInTime; }
    public String getCheckOutTime()      { return checkOutTime; }
    public String getImageBase64()       { return imageBase64; }
    public String getImageContentType()  { return imageContentType; }
    public List<String> getAmenities()   { return amenities; }
    public Boolean getIsActive()         { return isActive; }
}
