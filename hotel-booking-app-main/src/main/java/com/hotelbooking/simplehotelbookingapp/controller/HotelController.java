package com.hotelbooking.simplehotelbookingapp.controller;

import com.hotelbooking.simplehotelbookingapp.dto.HotelRequest;
import com.hotelbooking.simplehotelbookingapp.dto.HotelResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import com.hotelbooking.simplehotelbookingapp.service.HotelService;
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

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotel Management", description = "CRUD operations for hotels, including image upload/download. " +
        "GET endpoints require USER or ADMIN role. Write endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class HotelController {

    private final HotelService hotelService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create a new hotel",
            description = "Creates a hotel with full details. Only **name** and **location** are required. " +
                    "All other fields (description, address, starRating, hotelType, checkInTime, amenities, etc.) are optional. " +
                    "To attach an image, use the dedicated `POST /{id}/image` endpoint after creation. " +
                    "The response includes a **`hasImage`** boolean — `true` when an image is stored. " +
                    "Use `GET /{id}/image` as the `<img src>` to display it.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Hotel created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HotelResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed — missing required fields or invalid values", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content)
    })
    public ResponseEntity<HotelResponse> createHotel(@Valid @RequestBody HotelRequest hotelRequest) {
        return new ResponseEntity<>(hotelService.createHotel(hotelRequest), HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get hotel by ID", description = "Retrieves a single hotel by its database ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HotelResponse.class))),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
    })
    public ResponseEntity<HotelResponse> getHotelById(
            @Parameter(description = "Hotel database ID", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get hotel by exact name", description = "Looks up a hotel by its exact name (case-sensitive).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HotelResponse.class))),
            @ApiResponse(responseCode = "404", description = "No hotel found with that name", content = @Content)
    })
    public ResponseEntity<HotelResponse> getHotelByName(
            @Parameter(description = "Exact hotel name", example = "Taj Hotel", required = true)
            @PathVariable String name) {
        return ResponseEntity.ok(hotelService.getHotelByName(name));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(
            summary = "Get all hotels (paginated + filtered)",
            description = "Returns a paginated list of hotels. All filter parameters are optional and can be combined freely. " +
                    "Valid `sortBy` values: `id`, `name`, `location`, `city`, `country`, `starRating`, `hotelType`, `checkInTime`.")
    @ApiResponse(responseCode = "200", description = "Hotels retrieved successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PagedResponse.class)))
    public ResponseEntity<PagedResponse<HotelResponse>> getAllHotels(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0")  int page,
            @Parameter(description = "Page size (max 100)",   example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by. Allowed: id, name, location, city, country, starRating, hotelType, checkInTime", example = "name")
                @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction: `asc` or `desc`", example = "asc") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Filter by hotel name (partial, case-insensitive)", example = "Taj")            @RequestParam(required = false) String name,
            @Parameter(description = "Filter by location (partial, case-insensitive)", example = "Mumbai")          @RequestParam(required = false) String location,
            @Parameter(description = "Filter by city (partial, case-insensitive)", example = "New York")            @RequestParam(required = false) String city,
            @Parameter(description = "Filter by country (partial, case-insensitive)", example = "India")            @RequestParam(required = false) String country,
            @Parameter(description = "Filter by star rating (1–5)", example = "5")                                  @RequestParam(required = false) Integer starRating,
            @Parameter(description = "Filter by hotel type. Allowed values: BUDGET, LUXURY, BOUTIQUE, RESORT, BUSINESS", example = "LUXURY")
                @RequestParam(required = false) HotelType hotelType,
            @Parameter(description = "Filter by active status. Omit to return all; pass `true` for active only, `false` for inactive only", example = "true")
                @RequestParam(required = false) Boolean isActive) {

        return ResponseEntity.ok(hotelService.getAllHotels(
                page, size, sortBy, sortDir,
                name, location, city, country,
                starRating, hotelType, isActive));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Update hotel",
            description = "Fully replaces hotel details by ID. Supply all fields you want to keep — omitted optional fields are cleared. " +
                    "To update only the image, use `POST /{id}/image` instead.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HotelResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content)
    })
    public ResponseEntity<HotelResponse> updateHotel(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long id,
            @Valid @RequestBody HotelRequest hotelRequest) {
        return ResponseEntity.ok(hotelService.updateHotel(id, hotelRequest));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete hotel", description = "Permanently deletes the hotel and all its rooms. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Hotel deleted"),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content)
    })
    public ResponseEntity<Void> deleteHotel(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Upload / replace hotel image",
            description = "Uploads an image file and stores it as a BLOB in the database. " +
                    "Accepted types: **image/jpeg**, **image/png**, **image/webp**, **image/gif**. " +
                    "Re-uploading replaces the previous image. " +
                    "After a successful upload, **`hasImage`** will be `true` in the hotel response. " +
                    "Use `GET /{id}/image` directly as the `<img src>` to display it in the UI.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded — full hotel details returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = HotelResponse.class))),
            @ApiResponse(responseCode = "400", description = "File is empty or not an image type", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content)
    })
    public ResponseEntity<HotelResponse> uploadHotelImage(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long id,
            @Parameter(description = "Image file (jpeg/png/webp/gif). Field name must be `file`.", required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")))
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(hotelService.uploadImage(id, file));
    }

    @GetMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(
            summary = "Get hotel image (raw bytes)",
            description = "Returns the raw image bytes with the correct `Content-Type` header (e.g. `image/jpeg`). " +
                    "Use this URL directly as the `src` attribute of an `<img>` tag. " +
                    "Returns **404** if no image has been uploaded for this hotel.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image bytes returned",
                    content = {
                            @Content(mediaType = "image/jpeg"),
                            @Content(mediaType = "image/png"),
                            @Content(mediaType = "image/webp"),
                            @Content(mediaType = "image/gif")
                    }),
            @ApiResponse(responseCode = "404", description = "Hotel not found or no image uploaded", content = @Content)
    })
    public ResponseEntity<byte[]> getHotelImage(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long id) {
        HotelService.HotelImage image = hotelService.getImage(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, image.contentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(image.data());
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete hotel image", description = "Removes the stored image BLOB from the database for the given hotel. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Image removed"),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content)
    })
    public ResponseEntity<Void> deleteHotelImage(
            @Parameter(description = "Hotel database ID", example = "1", required = true) @PathVariable Long id) {
        hotelService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
