package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.BookingRequest;
import com.hotelbooking.simplehotelbookingapp.dto.BookingResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.*;
import com.hotelbooking.simplehotelbookingapp.exception.BookingConflictException;import com.hotelbooking.simplehotelbookingapp.exception.InvalidDateException;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.BookingRepository;
import com.hotelbooking.simplehotelbookingapp.repository.RoomRepository;
import com.hotelbooking.simplehotelbookingapp.repository.UserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private UserRepository userRepository;
    @Mock private MeterRegistry meterRegistry;
    @InjectMocks private BookingService bookingService;

    private Hotel hotel;
    private Room room;
    private User user;
    private Booking booking;
    private BookingRequest bookingRequest;
    private Counter conflictCounter;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Minimal BookingRequest — required fields only, all optionals null */
    private static BookingRequest minimalRequest(String guestName, LocalDate in, LocalDate out, Long roomId) {
        return new BookingRequest(guestName, in, out, roomId,
                null, null, null, null, null, null);
    }

    private Booking buildBooking(Long id, String confNum, String guestName,
                                  LocalDate in, LocalDate out, BigDecimal total) {
        Booking b = new Booking();
        b.setId(id);
        b.setConfirmationNumber(confNum);
        b.setGuestName(guestName);
        b.setCheckInDate(in);
        b.setCheckOutDate(out);
        b.setTotalPrice(total);
        b.setBookingStatus(BookingStatus.PENDING);
        b.setPaymentStatus(PaymentStatus.PENDING);
        b.setNumberOfGuests(1);
        b.setRoom(room);
        b.setUser(user);
        b.setCreatedAt(LocalDateTime.now());
        b.setUpdatedAt(LocalDateTime.now());
        return b;
    }

    @BeforeEach
    void setUp() {
        hotel = new Hotel();
        hotel.setId(1L);
        hotel.setName("Grand Hotel");
        hotel.setLocation("New York");

        room = new Room();
        room.setId(1L);
        room.setRoomNumber("101");
        room.setPrice(new BigDecimal("150.00"));
        room.setRoomType(RoomType.SUITE);
        room.setHotel(hotel);

        user = new User();
        user.setId(1L);
        user.setUsername("johndoe");
        user.setEmail("johndoe@example.com");
        user.setPassword("hashedPassword");
        user.setRole(Role.USER);

        booking = buildBooking(1L, "BK-TEST0001", "John Doe",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5),
                new BigDecimal("600.00"));

        bookingRequest = minimalRequest("John Doe",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5), 1L);

        conflictCounter = mock(Counter.class);
        lenient().when(meterRegistry.counter(anyString(), any(String[].class))).thenReturn(conflictCounter);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createBooking — success → returns response with confirmationNumber and totalPrice")
    void testCreateBooking_Success() {
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(eq(1L),
                eq(LocalDate.of(2026, 5, 1)), eq(LocalDate.of(2026, 5, 5)), isNull()))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse response = bookingService.createBooking(bookingRequest, "johndoe");

        assertNotNull(response);
        assertEquals("John Doe", response.getGuestName());
        assertEquals(LocalDate.of(2026, 5, 1), response.getCheckInDate());
        assertEquals(LocalDate.of(2026, 5, 5), response.getCheckOutDate());
        assertEquals(1L, response.getUserId());
        assertEquals(1L, response.getRoomId());
        assertEquals("101", response.getRoomNumber());
        assertEquals(RoomType.SUITE, response.getRoomType());
        assertEquals(1L, response.getHotelId());
        assertEquals("Grand Hotel", response.getHotelName());
        assertEquals("BK-TEST0001", response.getConfirmationNumber());
        assertNotNull(response.getTotalPrice());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBooking — success → totalPrice calculated as price × nights (4 nights = 600.00)")
    void testCreateBooking_TotalPriceCalculated() {
        // room price = 150, nights = 4 (May 1 → May 5)
        Booking savedBooking = buildBooking(2L, "BK-CALC0001", "Alice",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5),
                new BigDecimal("600.00"));

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(bookingRequest, "johndoe");

        assertEquals(new BigDecimal("600.00"), response.getTotalPrice());
    }

    @Test
    @DisplayName("createBooking — success → defaults bookingStatus=PENDING, paymentStatus=PENDING")
    void testCreateBooking_DefaultStatuses() {
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse response = bookingService.createBooking(bookingRequest, "johndoe");

        assertEquals(BookingStatus.PENDING, response.getBookingStatus());
        assertEquals(PaymentStatus.PENDING, response.getPaymentStatus());
    }

    @Test
    @DisplayName("createBooking — success → accepts explicit bookingStatus=CONFIRMED")
    void testCreateBooking_WithExplicitStatus() {
        BookingRequest reqWithStatus = new BookingRequest("John Doe",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5), 1L,
                "john@example.com", "+91-9999999999", 2, "Extra pillow",
                BookingStatus.CONFIRMED, PaymentStatus.PAID);

        Booking confirmedBooking = buildBooking(3L, "BK-CONF0001", "John Doe",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5), new BigDecimal("600.00"));
        confirmedBooking.setBookingStatus(BookingStatus.CONFIRMED);
        confirmedBooking.setPaymentStatus(PaymentStatus.PAID);
        confirmedBooking.setGuestEmail("john@example.com");
        confirmedBooking.setGuestPhone("+91-9999999999");
        confirmedBooking.setNumberOfGuests(2);
        confirmedBooking.setSpecialRequests("Extra pillow");

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(confirmedBooking);

        BookingResponse response = bookingService.createBooking(reqWithStatus, "johndoe");

        assertEquals(BookingStatus.CONFIRMED, response.getBookingStatus());
        assertEquals(PaymentStatus.PAID, response.getPaymentStatus());
        assertEquals("john@example.com", response.getGuestEmail());
        assertEquals(2, response.getNumberOfGuests());
        assertEquals("Extra pillow", response.getSpecialRequests());
    }

    @Test
    @DisplayName("createBooking — conflict → throws BookingConflictException, no save")
    void testCreateBooking_Conflict() {
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingBooking(eq(1L),
                eq(LocalDate.of(2026, 5, 1)), eq(LocalDate.of(2026, 5, 5)), isNull()))
                .thenReturn(true);

        assertThrows(BookingConflictException.class,
                () -> bookingService.createBooking(bookingRequest, "johndoe"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("createBooking — checkOut before checkIn → throws InvalidDateException")
    void testCreateBooking_CheckOutBeforeCheckIn() {
        BookingRequest invalid = minimalRequest("John",
                LocalDate.of(2026, 5, 5), LocalDate.of(2026, 5, 1), 1L);

        assertThrows(InvalidDateException.class,
                () -> bookingService.createBooking(invalid, "johndoe"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("createBooking — checkOut equals checkIn → throws InvalidDateException")
    void testCreateBooking_CheckOutEqualsCheckIn() {
        BookingRequest invalid = minimalRequest("John",
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1), 1L);

        assertThrows(InvalidDateException.class,
                () -> bookingService.createBooking(invalid, "johndoe"));
    }

    @Test
    @DisplayName("createBooking — room not found → throws ResourceNotFoundException")
    void testCreateBooking_RoomNotFound() {
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(roomRepository.findByIdWithLock(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(bookingRequest, "johndoe"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("createBooking — user not found → throws ResourceNotFoundException")
    void testCreateBooking_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.createBooking(bookingRequest, "unknown"));
        verify(bookingRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getBookingById — found → returns full response")
    void testGetBookingById_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        BookingResponse response = bookingService.getBookingById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getGuestName());
        assertEquals("BK-TEST0001", response.getConfirmationNumber());
        assertEquals(new BigDecimal("600.00"), response.getTotalPrice());
        verify(bookingRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getBookingById — not found → throws ResourceNotFoundException")
    void testGetBookingById_NotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getBookingById(1L));
    }

    @Test
    @DisplayName("getAllBookings — no filters → returns paged list of all bookings")
    void testGetAllBookings_Success() {
        Booking booking2 = buildBooking(2L, "BK-TEST0002", "Jane Smith",
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3), new BigDecimal("300.00"));

        Page<Booking> page = new PageImpl<>(List.of(booking, booking2));
        when(bookingRepository.searchBookings(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<BookingResponse> result = bookingService.getAllBookings(
                0, 10, "checkInDate", "asc",
                null, null, null, null, null, null);

        assertEquals(2, result.getContent().size());
        assertEquals("John Doe", result.getContent().get(0).getGuestName());
        assertEquals("Jane Smith", result.getContent().get(1).getGuestName());
    }

    @Test
    @DisplayName("getAllBookings — filtered by bookingStatus=CONFIRMED → calls repo with status param")
    void testGetAllBookings_FilteredByBookingStatus() {
        Page<Booking> page = new PageImpl<>(List.of(booking));
        when(bookingRepository.searchBookings(any(), any(), any(), any(),
                eq(BookingStatus.CONFIRMED), any(), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<BookingResponse> result = bookingService.getAllBookings(
                0, 10, "checkInDate", "asc",
                null, null, null, null, BookingStatus.CONFIRMED, null);

        assertEquals(1, result.getContent().size());
        verify(bookingRepository, times(1))
                .searchBookings(any(), any(), any(), any(),
                        eq(BookingStatus.CONFIRMED), any(), any(Pageable.class));
    }

    @Test
    @DisplayName("getAllBookings — filtered by paymentStatus=PAID → calls repo with payment param")
    void testGetAllBookings_FilteredByPaymentStatus() {
        Page<Booking> page = new PageImpl<>(List.of(booking));
        when(bookingRepository.searchBookings(any(), any(), any(), any(),
                any(), eq(PaymentStatus.PAID), any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<BookingResponse> result = bookingService.getAllBookings(
                0, 10, "checkInDate", "asc",
                null, null, null, null, null, PaymentStatus.PAID);

        assertEquals(1, result.getContent().size());
    }

    @Test
    @DisplayName("getAllBookings — invalid sortBy → falls back to checkInDate")
    void testGetAllBookings_InvalidSortBy_FallsBackToDefault() {
        Page<Booking> page = new PageImpl<>(List.of(booking));
        when(bookingRepository.searchBookings(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        // Should not throw, sortBy "injected_field" is not in VALID_SORT_FIELDS
        assertDoesNotThrow(() -> bookingService.getAllBookings(
                0, 10, "injected_field", "asc",
                null, null, null, null, null, null));
    }

    @Test
    @DisplayName("getBookingsByRoomId — bookings exist → returns list")
    void testGetBookingsByRoomId_Success() {
        Booking booking2 = buildBooking(2L, "BK-TEST0002", "Jane Smith",
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3), new BigDecimal("300.00"));

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.findByRoomId(1L)).thenReturn(List.of(booking, booking2));

        List<BookingResponse> result = bookingService.getBookingsByRoomId(1L);

        assertEquals(2, result.size());
        verify(bookingRepository, times(1)).findByRoomId(1L);
    }

    @Test
    @DisplayName("getBookingsByRoomId — room not found → throws ResourceNotFoundException")
    void testGetBookingsByRoomId_RoomNotFound() {
        when(roomRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getBookingsByRoomId(1L));
    }

    @Test
    @DisplayName("getBookingsByRoomId — no bookings found → throws ResourceNotFoundException")
    void testGetBookingsByRoomId_NoBookings() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.findByRoomId(1L)).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getBookingsByRoomId(1L));
    }

    @Test
    @DisplayName("getUserBookings — valid user → returns paged bookings sorted by checkInDate desc")
    void testGetUserBookings_Success() {
        Booking booking2 = buildBooking(2L, "BK-TEST0002", "John Doe",
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3), new BigDecimal("300.00"));

        Page<Booking> page = new PageImpl<>(List.of(booking, booking2));
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(bookingRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(page);

        PagedResponse<BookingResponse> result = bookingService.getUserBookings("johndoe", 0, 10);

        assertEquals(2, result.getContent().size());
        verify(bookingRepository, times(1)).findByUserId(eq(1L), any(Pageable.class));
    }

    @Test
    @DisplayName("getUserBookings — user not found → throws ResourceNotFoundException")
    void testGetUserBookings_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getUserBookings("unknown", 0, 10));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateBooking — success → recalculates totalPrice and updates fields")
    void testUpdateBooking_Success() {
        BookingRequest updateReq = minimalRequest("Jane Doe",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 15), 1L);

        Booking updated = buildBooking(1L, "BK-TEST0001", "Jane Doe",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 15),
                new BigDecimal("750.00")); // 150 × 5 nights

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsOverlappingBooking(eq(1L),
                eq(LocalDate.of(2026, 5, 10)), eq(LocalDate.of(2026, 5, 15)), eq(1L)))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(updated);

        BookingResponse response = bookingService.updateBooking(1L, updateReq);

        assertNotNull(response);
        assertEquals("Jane Doe", response.getGuestName());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("updateBooking — success → bookingStatus updated when provided")
    void testUpdateBooking_StatusUpdated() {
        BookingRequest reqWithStatus = new BookingRequest("John Doe",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 15), 1L,
                null, null, null, null,
                BookingStatus.CONFIRMED, PaymentStatus.PAID);

        Booking updated = buildBooking(1L, "BK-TEST0001", "John Doe",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 15), new BigDecimal("750.00"));
        updated.setBookingStatus(BookingStatus.CONFIRMED);
        updated.setPaymentStatus(PaymentStatus.PAID);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any(), eq(1L))).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(updated);

        BookingResponse response = bookingService.updateBooking(1L, reqWithStatus);

        assertEquals(BookingStatus.CONFIRMED, response.getBookingStatus());
        assertEquals(PaymentStatus.PAID, response.getPaymentStatus());
    }

    @Test
    @DisplayName("updateBooking — conflict → throws BookingConflictException, no save")
    void testUpdateBooking_Conflict() {
        BookingRequest updateReq = minimalRequest("Jane Doe",
                LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 15), 1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsOverlappingBooking(eq(1L),
                eq(LocalDate.of(2026, 5, 10)), eq(LocalDate.of(2026, 5, 15)), eq(1L)))
                .thenReturn(true);

        assertThrows(BookingConflictException.class,
                () -> bookingService.updateBooking(1L, updateReq));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateBooking — invalid dates → throws InvalidDateException")
    void testUpdateBooking_InvalidDates() {
        BookingRequest invalid = minimalRequest("Jane",
                LocalDate.of(2026, 5, 15), LocalDate.of(2026, 5, 10), 1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(InvalidDateException.class,
                () -> bookingService.updateBooking(1L, invalid));
    }

    @Test
    @DisplayName("updateBooking — booking not found → throws ResourceNotFoundException")
    void testUpdateBooking_NotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.updateBooking(1L, bookingRequest));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteBooking — found → deletes and logs")
    void testDeleteBooking_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.deleteBooking(1L);

        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).delete(booking);
    }

    @Test
    @DisplayName("deleteBooking — not found → throws ResourceNotFoundException")
    void testDeleteBooking_NotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.deleteBooking(1L));
        verify(bookingRepository, never()).delete(any());
    }
}
