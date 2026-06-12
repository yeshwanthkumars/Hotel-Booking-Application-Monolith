package com.hotelbooking.simplehotelbookingapp.controller;

import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RoomRequest;
import com.hotelbooking.simplehotelbookingapp.dto.RoomResponse;
import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import com.hotelbooking.simplehotelbookingapp.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "CRUD operations for hotel rooms, including image upload/download. " +
        "GET endpoints require USER or ADMIN role. Write endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {

    private final RoomService roomService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new room",
            description = "Creates a room under an existing hotel. **roomNumber**, **price**, and **hotelId** are required. " +
                    "All other fields are optional. The response includes **`hotelName`** (denormalized for display) and " +
                    "**`hasImage`** (`true` when an image has been stored). " +
                    "To attach an image, use the dedicated `POST /{id}/image` endpoint after creation.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Room created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoomResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content)
    })
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest roomRequest) {
        return new ResponseEntity<>(roomService.createRoom(roomRequest), HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get room by ID", description = "Retrieves a single room by its database ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Room found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoomResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<RoomResponse> getRoomById(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get all rooms for a hotel", description = "Returns all rooms belonging to the specified hotel.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rooms retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoomResponse.class))),
            @ApiResponse(responseCode = "404", description = "Hotel not found or no rooms exist", content = @Content)
    })
    public ResponseEntity<List<RoomResponse>> getRoomsByHotelId(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(hotelId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get all rooms (paginated + filtered)",
            description = "Returns a paginated list of rooms. All filter parameters are optional and combinable. " +
                    "Valid `sortBy` values: `id`, `roomNumber`, `price`, `weekendPrice`, `roomType`, `bedType`, `maxOccupancy`, `floorNumber`, `roomSizeInSqFt`, `status`.")
    @ApiResponse(responseCode = "200", description = "Rooms retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagedResponse.class)))
    public ResponseEntity<PagedResponse<RoomResponse>> getAllRooms(
            @Parameter(description = "Page number (0-based)", example = "0")           @RequestParam(defaultValue = "0")   int page,
            @Parameter(description = "Page size (max 100)", example = "10")            @RequestParam(defaultValue = "10")  int size,
            @Parameter(description = "Sort field", example = "price")                  @RequestParam(defaultValue = "id")  String sortBy,
            @Parameter(description = "Sort direction: asc or desc", example = "asc")   @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Filter by hotel ID", example = "1")              @RequestParam(required = false) Long hotelId,
            @Parameter(description = "Filter by room number (partial)", example = "10") @RequestParam(required = false) String roomNumber,
            @Parameter(description = "Minimum nightly price", example = "100.00")      @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum nightly price", example = "500.00")      @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Filter by room type. Allowed: SINGLE, DOUBLE, SUITE, DELUXE, FAMILY", example = "SUITE")
                @RequestParam(required = false) RoomType roomType,
            @Parameter(description = "Filter by status. Allowed: AVAILABLE, BOOKED, MAINTENANCE, OUT_OF_SERVICE", example = "AVAILABLE")
                @RequestParam(required = false) RoomStatus status,
            @Parameter(description = "Filter by active flag. true = bookable rooms only", example = "true")
                @RequestParam(required = false) Boolean isActive) {

        return ResponseEntity.ok(roomService.getAllRooms(
                page, size, sortBy, sortDir,
                hotelId, roomNumber, minPrice, maxPrice,
                roomType, status, isActive));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update room",
            description = "Fully replaces room details by ID. The hotel cannot be changed on update. " +
                    "To update only the image, use `POST /{id}/image` instead.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Room updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoomResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<RoomResponse> updateRoom(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id,
            @Valid @RequestBody RoomRequest roomRequest) {
        return ResponseEntity.ok(roomService.updateRoom(id, roomRequest));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete room", description = "Permanently deletes the room. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Room deleted"),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<Void> deleteRoom(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload / replace room image",
            description = "Uploads an image file and stores it as a BLOB in the database. " +
                    "Accepted types: **image/jpeg**, **image/png**, **image/webp**, **image/gif**. " +
                    "Re-uploading replaces the previous image. " +
                    "After a successful upload, **`hasImage`** will be `true` in the room response. " +
                    "Use `GET /{id}/image` directly as the `<img src>` to display it in the UI. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded — full room details returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoomResponse.class))),
            @ApiResponse(responseCode = "400", description = "File is empty or not an image type", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<RoomResponse> uploadRoomImage(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "Image file (jpeg/png/webp/gif). Field name must be `file`.", required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")))
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(roomService.uploadImage(id, file));
    }

    @GetMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get room image (raw bytes)",
            description = "Returns the raw image bytes with the correct `Content-Type` header. " +
                    "Use this URL directly as the `src` of an `<img>` tag. Returns 404 if no image has been uploaded.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image bytes returned",
                    content = {
                            @Content(mediaType = "image/jpeg"),
                            @Content(mediaType = "image/png"),
                            @Content(mediaType = "image/webp"),
                            @Content(mediaType = "image/gif")
                    }),
            @ApiResponse(responseCode = "404", description = "Room not found or no image uploaded", content = @Content)
    })
    public ResponseEntity<byte[]> getRoomImage(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id) {
        RoomService.RoomImage image = roomService.getImage(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, image.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(image.data());
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete room image", description = "Removes the stored image BLOB from the database. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Image removed"),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<Void> deleteRoomImage(
            @Parameter(description = "Room database ID", example = "1", required = true) @PathVariable Long id) {
        roomService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
