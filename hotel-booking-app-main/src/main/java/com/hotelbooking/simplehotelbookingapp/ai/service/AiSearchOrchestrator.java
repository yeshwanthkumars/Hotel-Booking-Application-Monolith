package com.hotelbooking.simplehotelbookingapp.ai.service;

import com.hotelbooking.simplehotelbookingapp.ai.dto.AiSearchRequest;
import com.hotelbooking.simplehotelbookingapp.ai.dto.AiSearchResponse;
import com.hotelbooking.simplehotelbookingapp.ai.dto.SearchQuery;
import com.hotelbooking.simplehotelbookingapp.dto.HotelResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RoomResponse;
import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.repository.BookingRepository;
import com.hotelbooking.simplehotelbookingapp.service.HotelService;
import com.hotelbooking.simplehotelbookingapp.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Orchestrates the AI-powered natural language hotel search.
 *
 * <p>Phase 1 — always runs: parses the query with Claude, then delegates to
 * {@link HotelService#getAllHotels} using the extracted filters.
 *
 * <p>Phase 2 — runs only when check-in and check-out dates are extracted:
 * retrieves rooms via {@link RoomService#getAllRooms}, restricts them to the
 * hotels found in Phase 1, and filters out any room with an overlapping
 * booking using the existing {@link BookingRepository#existsOverlappingBooking}
 * query (zero duplication of business logic).
 */
@Service
@RequiredArgsConstructor
public class AiSearchOrchestrator {

    private static final Logger logger = LoggerFactory.getLogger(AiSearchOrchestrator.class);
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final QueryParserAiService queryParserAiService;
    private final HotelService hotelService;
    private final RoomService roomService;
    private final BookingRepository bookingRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AiSearchResponse search(AiSearchRequest request) {
        String today = LocalDate.now().toString();
        SearchQuery parsed = queryParserAiService.parse(request.query(), today);

        logger.info("AI parsed query '{}' → city={}, location={}, checkIn={}, checkOut={}, price={}-{}",
                request.query(), parsed.getCity(), parsed.getLocation(),
                parsed.getCheckInDate(), parsed.getCheckOutDate(),
                parsed.getMinPrice(), parsed.getMaxPrice());

        // ── Phase 1: Hotel search with extracted criteria ──────────────────
        List<HotelResponse> hotels = hotelService.getAllHotels(
                0, DEFAULT_PAGE_SIZE, "name", "asc",
                parsed.getHotelName(),
                parsed.getLocation(),
                parsed.getCity(),
                parsed.getCountry(),
                parsed.getStarRating(),
                null,
                true
        ).getContent();

        // ── Phase 2: Availability search (only when dates are present) ─────
        LocalDate checkIn  = parseDate(parsed.getCheckInDate());
        LocalDate checkOut = parseDate(parsed.getCheckOutDate());
        boolean isAvailabilitySearch = checkIn != null && checkOut != null;
        List<RoomResponse> availableRooms = List.of();

        if (isAvailabilitySearch) {
            // Restrict rooms to hotels that matched the location criteria.
            // If no hotels matched (e.g. no location in query), search all hotels.
            Set<Long> matchedHotelIds = hotels.stream()
                    .map(h -> h.id())
                    .collect(Collectors.toSet());

            final LocalDate finalCheckIn  = checkIn;
            final LocalDate finalCheckOut = checkOut;

            availableRooms = roomService.getAllRooms(
                    0, 50, "price", "asc", null, null,
                    parsed.getMinPrice(), parsed.getMaxPrice(),
                    null, RoomStatus.AVAILABLE, true
            ).getContent()
            .stream()
            // Keep only rooms belonging to matched hotels (or all if no location given)
            .filter(room -> matchedHotelIds.isEmpty() || matchedHotelIds.contains(room.hotelId()))
            // Reuse existing booking overlap query — no business logic duplicated
            .filter(room -> !bookingRepository.existsOverlappingBooking(
                    room.id(), finalCheckIn, finalCheckOut, null))
            .toList();
        }

        return new AiSearchResponse(
                request.query(),
                hotels,
                availableRooms,
                isAvailabilitySearch,
                hotels.size(),
                availableRooms.size()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Safely parses a YYYY-MM-DD string from the AI response.
     * Returns {@code null} (and logs a warning) if the string is blank or unparseable,
     * so the orchestrator gracefully degrades to Phase 1 only.
     */
    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            logger.warn("AI returned unparseable date: '{}' — skipping availability search", date);
            return null;
        }
    }
}

