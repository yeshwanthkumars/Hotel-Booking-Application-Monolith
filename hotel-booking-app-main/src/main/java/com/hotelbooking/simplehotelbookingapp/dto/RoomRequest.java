package com.hotelbooking.simplehotelbookingapp.dto;

import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request body for creating or updating a room. roomNumber, price and hotelId are required.")
public record RoomRequest(
        @Schema(description = "Room number or identifier", example = "101", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Room number is required")
        String roomNumber,

        @Schema(description = "Nightly base price (must be > 0)", example = "150.00", requiredMode = Schema.RequiredMode.REQUIRED)
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,

        @Schema(description = "ID of the hotel this room belongs to", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Hotel ID is required")
        Long hotelId,

        @Schema(description = "Short description of the room", example = "Spacious suite with ocean view and private balcony.")
        String description,

        @Schema(description = "Room category. Allowed: SINGLE, DOUBLE, SUITE, DELUXE, FAMILY",
                example = "SUITE", allowableValues = {"SINGLE", "DOUBLE", "SUITE", "DELUXE", "FAMILY"})
        RoomType roomType,

        @Schema(description = "Bed configuration e.g. KING, QUEEN, TWIN, DOUBLE", example = "KING")
        String bedType,

        @Schema(description = "Maximum number of guests allowed", example = "2")
        Integer maxOccupancy,

        @Schema(description = "Floor on which the room is located", example = "5")
        Integer floorNumber,

        @Schema(description = "Room size in square feet", example = "450.0")
        Double roomSizeInSqFt,

        @Schema(description = "View type e.g. OCEAN, CITY, GARDEN, POOL, MOUNTAIN", example = "OCEAN")
        String viewType,

        @Schema(description = "Weekend/peak price (must be > 0 if provided)", example = "200.00")
        @DecimalMin(value = "0.0", inclusive = false, message = "Weekend price must be greater than 0")
        BigDecimal weekendPrice,

        @Schema(description = "List of in-room amenities", example = "[\"AC\", \"TV\", \"Mini Bar\", \"Safe\"]")
        List<String> amenities,

        @Schema(description = "Room operational status. Allowed: AVAILABLE, BOOKED, MAINTENANCE, OUT_OF_SERVICE",
                example = "AVAILABLE", allowableValues = {"AVAILABLE", "BOOKED", "MAINTENANCE", "OUT_OF_SERVICE"})
        RoomStatus status,

        @Schema(description = "Whether the room is active and bookable. Defaults to true.", example = "true")
        Boolean isActive,

        @Schema(description = "Base64-encoded image bytes. For UI uploads use POST /{id}/image instead.",
                example = "/9j/4AAQSkZJRgAB...")
        String imageBase64,

        @Schema(description = "MIME type of the image in imageBase64.", example = "image/jpeg",
                allowableValues = {"image/jpeg", "image/png", "image/webp", "image/gif"})
        String imageContentType

) {
    public String getRoomNumber()        { return roomNumber; }
    public BigDecimal getPrice()         { return price; }
    public Long getHotelId()             { return hotelId; }
    public String getDescription()       { return description; }
    public RoomType getRoomType()        { return roomType; }
    public String getBedType()           { return bedType; }
    public Integer getMaxOccupancy()     { return maxOccupancy; }
    public Integer getFloorNumber()      { return floorNumber; }
    public Double getRoomSizeInSqFt()    { return roomSizeInSqFt; }
    public String getViewType()          { return viewType; }
    public BigDecimal getWeekendPrice()  { return weekendPrice; }
    public List<String> getAmenities()   { return amenities; }
    public RoomStatus getStatus()        { return status; }
    public Boolean getIsActive()         { return isActive; }
    public String getImageBase64()       { return imageBase64; }
    public String getImageContentType()  { return imageContentType; }
}
