package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.BookingRequest;
import com.hotelbooking.simplehotelbookingapp.dto.BookingResponse;
import com.hotelbooking.simplehotelbookingapp.dto.CancellationResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.Booking;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import com.hotelbooking.simplehotelbookingapp.entity.Room;
import com.hotelbooking.simplehotelbookingapp.entity.User;
import com.hotelbooking.simplehotelbookingapp.exception.BookingConflictException;
import com.hotelbooking.simplehotelbookingapp.exception.InvalidDateException;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.BookingRepository;
import com.hotelbooking.simplehotelbookingapp.repository.RoomRepository;
import com.hotelbooking.simplehotelbookingapp.repository.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private static final Set<String> VALID_SORT_FIELDS = Set.of(
            "id", "guestName", "checkInDate", "checkOutDate",
            "totalPrice", "bookingStatus", "paymentStatus", "createdAt", "updatedAt"
    );

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final MeterRegistry meterRegistry;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    public BookingResponse createBooking(BookingRequest request, String username) {
        validateDates(request.getCheckInDate(), request.getCheckOutDate());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        checkOverlap(room.getId(), request.getCheckInDate(), request.getCheckOutDate(), null, "create");

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getPrice().multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setConfirmationNumber(generateConfirmationNumber());
        booking.setGuestName(request.getGuestName());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setNumberOfGuests(request.getNumberOfGuests() != null ? request.getNumberOfGuests() : 1);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalPrice(totalPrice);
        booking.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.PENDING);
        booking.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.PENDING);
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setRoom(room);
        booking.setUser(user);

        Booking saved = bookingRepository.save(booking);
        logger.info("Booking {} created for user {} in room {}", saved.getConfirmationNumber(), username, room.getRoomNumber());
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return mapToResponse(findBookingOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getAllBookings(int page, int size,
                                                         String sortBy, String sortDir,
                                                         Long roomId, String guestName,
                                                         LocalDate checkInFrom, LocalDate checkInTo,
                                                         BookingStatus bookingStatus,
                                                         PaymentStatus paymentStatus) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String safeSortBy = VALID_SORT_FIELDS.contains(sortBy) ? sortBy : "checkInDate";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSortBy));
        Page<BookingResponse> resultPage = bookingRepository.searchBookings(
                        roomId,
                        blankToNull(guestName),
                        checkInFrom,
                        checkInTo,
                        bookingStatus,
                        paymentStatus,
                        pageable)
                .map(this::mapToResponse);

        return new PagedResponse<>(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByRoomId(Long roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        List<Booking> bookings = bookingRepository.findByRoomId(roomId);
        if (bookings.isEmpty()) {
            throw new ResourceNotFoundException("No bookings found for room ID: " + roomId);
        }
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getUserBookings(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "checkInDate"));
        Page<Booking> bookingPage = bookingRepository.findByUserId(user.getId(), pageable);

        return new PagedResponse<>(
                bookingPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements(),
                bookingPage.getTotalPages(),
                bookingPage.isLast()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = findBookingOrThrow(id);
        validateDates(request.getCheckInDate(), request.getCheckOutDate());
        checkOverlap(booking.getRoom().getId(), request.getCheckInDate(), request.getCheckOutDate(), id, "update");

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = booking.getRoom().getPrice().multiply(BigDecimal.valueOf(nights));

        booking.setGuestName(request.getGuestName());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setNumberOfGuests(request.getNumberOfGuests() != null ? request.getNumberOfGuests() : booking.getNumberOfGuests());
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalPrice(totalPrice);
        booking.setSpecialRequests(request.getSpecialRequests());
        if (request.getBookingStatus() != null) booking.setBookingStatus(request.getBookingStatus());
        if (request.getPaymentStatus() != null) booking.setPaymentStatus(request.getPaymentStatus());

        Booking updated = bookingRepository.save(booking);
        logger.info("Booking ID {} updated", id);
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL
    // ─────────────────────────────────────────────────────────────────────────

    public CancellationResponse cancelBooking(Long id, String username, boolean isAdmin) {
        Booking booking = findBookingOrThrow(id);

        // Ownership check: USER can only cancel their own bookings
        if (!isAdmin && !booking.getUser().getUsername().equals(username)) {
            throw new IllegalStateException("You are not allowed to cancel this booking.");
        }

        BookingStatus current = booking.getBookingStatus();

        if (current == BookingStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Booking " + booking.getConfirmationNumber() + " is already cancelled.");
        }
        if (current == BookingStatus.COMPLETED || current == BookingStatus.NO_SHOW) {
            throw new IllegalStateException(
                    "Booking " + booking.getConfirmationNumber() + " cannot be cancelled — stay is already " + current + ".");
        }

        // Auto-refund if the booking was already paid
        boolean refunded = false;
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            refunded = true;
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        String message = refunded
                ? "Booking " + booking.getConfirmationNumber() + " has been successfully cancelled and a refund has been initiated."
                : "Booking " + booking.getConfirmationNumber() + " has been successfully cancelled.";

        logger.info("Booking {} cancelled by user '{}'. Refunded: {}", booking.getConfirmationNumber(), username, refunded);

        return new CancellationResponse(
                message,
                booking.getId(),
                booking.getConfirmationNumber(),
                BookingStatus.CANCELLED,
                booking.getPaymentStatus(),
                refunded
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    public void deleteBooking(Long id) {
        Booking booking = findBookingOrThrow(id);
        bookingRepository.delete(booking);
        logger.info("Booking ID {} deleted", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new InvalidDateException("Check-out date must be after check-in date");
        }
    }

    private void checkOverlap(Long roomId, LocalDate checkIn, LocalDate checkOut,
                               Long excludeId, String operation) {
        boolean conflict = bookingRepository.existsOverlappingBooking(roomId, checkIn, checkOut, excludeId);
        if (conflict) {
            meterRegistry.counter("booking.conflicts.total", "operation", operation).increment();
            logger.warn("Booking conflict for room {} on {} to {}", roomId, checkIn, checkOut);
            throw new BookingConflictException(
                    "Room is already booked for the selected dates: " + checkIn + " to " + checkOut);
        }
    }

    private String generateConfirmationNumber() {
        return "BK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private BookingResponse mapToResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getConfirmationNumber(),
                b.getGuestName(),
                b.getGuestEmail(),
                b.getGuestPhone(),
                b.getNumberOfGuests(),
                b.getCheckInDate(),
                b.getCheckOutDate(),
                b.getTotalPrice(),
                b.getBookingStatus(),
                b.getPaymentStatus(),
                b.getSpecialRequests(),
                b.getRoom().getId(),
                b.getRoom().getRoomNumber(),
                b.getRoom().getRoomType(),
                b.getRoom().getHotel() != null ? b.getRoom().getHotel().getId() : null,
                b.getRoom().getHotel() != null ? b.getRoom().getHotel().getName() : null,
                b.getUser().getId(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}
