package com.hotelbooking.simplehotelbookingapp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Full room details returned by the API.")
public record RoomResponse(
        @Schema(description = "Auto-generated room ID", example = "1")
        Long id,

        @Schema(description = "Room number or identifier", example = "101")
        String roomNumber,

        @Schema(description = "Nightly base price", example = "150.00")
        BigDecimal price,

        @Schema(description = "ID of the hotel this room belongs to", example = "1")
        Long hotelId,

        @Schema(description = "Name of the hotel this room belongs to", example = "Taj Hotel")
        String hotelName,

        @Schema(description = "Short description of the room", example = "Spacious suite with ocean view.")
        String description,

        @Schema(description = "Room category", example = "SUITE",
                allowableValues = {"SINGLE", "DOUBLE", "SUITE", "DELUXE", "FAMILY"})
        RoomType roomType,

        @Schema(description = "Bed configuration", example = "KING")
        String bedType,

        @Schema(description = "Maximum number of guests", example = "2")
        Integer maxOccupancy,

        @Schema(description = "Floor number", example = "5")
        Integer floorNumber,

        @Schema(description = "Room size in square feet", example = "450.0")
        Double roomSizeInSqFt,

        @Schema(description = "View type from the room", example = "OCEAN")
        String viewType,

        @Schema(description = "Weekend / peak nightly price", example = "200.00")
        BigDecimal weekendPrice,

        @Schema(description = "List of in-room amenities", example = "[\"AC\", \"TV\", \"Mini Bar\"]")
        List<String> amenities,

        @Schema(description = "Operational status of the room", example = "AVAILABLE",
                allowableValues = {"AVAILABLE", "BOOKED", "MAINTENANCE", "OUT_OF_SERVICE"})
        RoomStatus status,

        @Schema(description = "Whether the room is active and bookable", example = "true")
        Boolean isActive,

        @Schema(description = "True if a room image has been uploaded. Use GET /api/v1/rooms/{id}/image as <img src> to display it.",
                example = "true")
        Boolean hasImage,

        @Schema(description = "Record creation timestamp (ISO-8601)", example = "2026-05-30T10:00:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @Schema(description = "Record last-updated timestamp (ISO-8601)", example = "2026-05-30T12:30:00")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt

) {
    public Long getId()                  { return id; }
    public String getRoomNumber()        { return roomNumber; }
    public BigDecimal getPrice()         { return price; }
    public Long getHotelId()             { return hotelId; }
    public String getHotelName()         { return hotelName; }
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
    public Boolean getHasImage()         { return hasImage; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }
}
