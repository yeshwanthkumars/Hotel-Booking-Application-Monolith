package com.hotelbooking.simplehotelbookingapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Room number is required")
    @Column(nullable = false)
    private String roomNumber;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    private RoomType roomType;

    /** Bed configuration e.g. KING, QUEEN, TWIN, DOUBLE */
    @Column(name = "bed_type")
    private String bedType;

    @Column(name = "max_occupancy")
    private Integer maxOccupancy;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "room_size_in_sq_ft")
    private Double roomSizeInSqFt;

    /** View from the room e.g. OCEAN, CITY, GARDEN, POOL, MOUNTAIN */
    @Column(name = "view_type")
    private String viewType;

    @DecimalMin(value = "0.0", inclusive = false, message = "Weekend price must be greater than 0")
    @Column(name = "weekend_price", precision = 10, scale = 2)
    private BigDecimal weekendPrice;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(name = "is_active")
    private Boolean isActive = Boolean.TRUE;


    @Lob
    @Column(name = "image_data")
    private byte[] imageData;

    /** MIME type of the stored image e.g. "image/jpeg", "image/png" */
    @Column(name = "image_content_type")
    private String imageContentType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
}
