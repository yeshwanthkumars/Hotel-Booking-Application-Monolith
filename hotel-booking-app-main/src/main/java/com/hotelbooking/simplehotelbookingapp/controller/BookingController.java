package com.hotelbooking.simplehotelbookingapp.controller;

import com.hotelbooking.simplehotelbookingapp.dto.BookingRequest;
import com.hotelbooking.simplehotelbookingapp.dto.BookingResponse;
import com.hotelbooking.simplehotelbookingapp.dto.CancellationResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import com.hotelbooking.simplehotelbookingapp.service.BookingService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management",
        description = "APIs for creating and managing hotel room bookings. " +
                "Guests (USER/ADMIN) can create bookings and view their own. " +
                "All admin-level read and write operations require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Create a booking",
            description = "Creates a new room booking for the authenticated user. " +
                    "**guestName**, **checkInDate**, **checkOutDate** and **roomId** are required. " +
                    "A unique **confirmationNumber** (e.g. BK-A1B2C3D4) and **totalPrice** " +
                    "(roomPrice × nights) are auto-calculated. " +
                    "The response includes **`roomType`**, **`roomNumber`**, **`hotelId`** and **`hotelName`** for display convenience. " +
                    "Default bookingStatus = PENDING, paymentStatus = PENDING.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Booking created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed or invalid date range", content = @Content),
            @ApiResponse(responseCode = "409", description = "Room already booked for selected dates", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content)
    })
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest bookingRequest,
            Authentication authentication) {
        return new ResponseEntity<>(
                bookingService.createBooking(bookingRequest, authentication.getName()),
                HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get booking by ID", description = "Retrieves a single booking by its database ID. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<BookingResponse> getBookingById(
            @Parameter(description = "Booking database ID", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings (paginated + filtered)",
            description = "Returns a paginated list of all bookings. All filter params are optional. " +
                    "Valid `sortBy` values: `id`, `guestName`, `checkInDate`, `checkOutDate`, " +
                    "`totalPrice`, `bookingStatus`, `paymentStatus`, `createdAt`, `updatedAt`. (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = PagedResponse.class)))
    public ResponseEntity<PagedResponse<BookingResponse>> getAllBookings(
            @Parameter(description = "Page number (0-based)", example = "0")
                @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)", example = "10")
                @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field", example = "checkInDate")
                @RequestParam(defaultValue = "checkInDate") String sortBy,
            @Parameter(description = "Sort direction: asc or desc", example = "asc")
                @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Filter by room ID", example = "1")
                @RequestParam(required = false) Long roomId,
            @Parameter(description = "Filter by guest name (partial match)", example = "Yeshwanth")
                @RequestParam(required = false) String guestName,
            @Parameter(description = "Check-in date from (inclusive, yyyy-MM-dd)", example = "2026-06-01")
                @RequestParam(required = false) LocalDate checkInFrom,
            @Parameter(description = "Check-in date to (inclusive, yyyy-MM-dd)", example = "2026-12-31")
                @RequestParam(required = false) LocalDate checkInTo,
            @Parameter(description = "Filter by booking status. Allowed: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW",
                    example = "CONFIRMED")
                @RequestParam(required = false) BookingStatus bookingStatus,
            @Parameter(description = "Filter by payment status. Allowed: PENDING, PAID, REFUNDED, FAILED",
                    example = "PAID")
                @RequestParam(required = false) PaymentStatus paymentStatus) {

        return ResponseEntity.ok(bookingService.getAllBookings(
                page, size, sortBy, sortDir,
                roomId, guestName, checkInFrom, checkInTo,
                bookingStatus, paymentStatus));
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by room ID",
            description = "Retrieves all bookings for a specific room. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bookings retrieved",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found or no bookings for room", content = @Content)
    })
    public ResponseEntity<List<BookingResponse>> getBookingsByRoomId(
            @Parameter(description = "Room database ID", example = "1", required = true)
            @PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getBookingsByRoomId(roomId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — USER / ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get my bookings",
            description = "Returns all bookings belonging to the currently authenticated user. " +
                    "Sorted by check-in date descending.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User bookings retrieved",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    public ResponseEntity<PagedResponse<BookingResponse>> getMyBookings(
            @Parameter(description = "Page number (0-based)", example = "0")
                @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)", example = "10")
                @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(
                bookingService.getUserBookings(authentication.getName(), page, size));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update booking",
            description = "Updates booking details by ID. The room cannot be changed on update. " +
                    "If new dates are provided, totalPrice is recalculated automatically. " +
                    "To change status/payment, include bookingStatus or paymentStatus in the body. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation failed or invalid date range", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Room already booked for selected dates", content = @Content)
    })
    public ResponseEntity<BookingResponse> updateBooking(
            @Parameter(description = "Booking database ID", example = "1", required = true)
                @PathVariable Long id,
            @Valid @RequestBody BookingRequest bookingRequest) {
        return ResponseEntity.ok(bookingService.updateBooking(id, bookingRequest));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Cancel a booking",
            description = "Cancels a booking by ID. " +
                    "**USER** can only cancel their own bookings. **ADMIN** can cancel any booking. " +
                    "If the booking was already **PAID**, a refund is automatically issued (`paymentStatus → REFUNDED`). " +
                    "Bookings with status **COMPLETED** or **NO_SHOW** cannot be cancelled. " +
                    "A descriptive cancellation message is included in the response.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking cancelled successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CancellationResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — cannot cancel another user's booking", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Booking is already cancelled, completed, or a no-show", content = @Content)
    })
    public ResponseEntity<CancellationResponse> cancelBooking(
            @Parameter(description = "Booking database ID", example = "1", required = true)
            @PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(bookingService.cancelBooking(id, authentication.getName(), isAdmin));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete booking", description = "Permanently deletes a booking by ID. (ADMIN only)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Booking deleted"),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<Void> deleteBooking(
            @Parameter(description = "Booking database ID", example = "1", required = true)
            @PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
