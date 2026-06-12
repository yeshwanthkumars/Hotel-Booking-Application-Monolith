package com.hotelbooking.simplehotelbookingapp.repository;

import com.hotelbooking.simplehotelbookingapp.entity.Booking;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByGuestName(String guestName);
    List<Booking> findByCheckInDateBetween(LocalDate startDate, LocalDate endDate);
    List<Booking> findByCheckOutDateBetween(LocalDate startDate, LocalDate endDate);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:roomId IS NULL OR b.room.id = :roomId) " +
           "AND (:guestName IS NULL OR LOWER(b.guestName) LIKE LOWER(CONCAT('%', :guestName, '%'))) " +
           "AND (:checkInFrom IS NULL OR b.checkInDate >= :checkInFrom) " +
           "AND (:checkInTo IS NULL OR b.checkInDate <= :checkInTo) " +
           "AND (:bookingStatus IS NULL OR b.bookingStatus = :bookingStatus) " +
           "AND (:paymentStatus IS NULL OR b.paymentStatus = :paymentStatus)")
    Page<Booking> searchBookings(@Param("roomId") Long roomId,
                                 @Param("guestName") String guestName,
                                 @Param("checkInFrom") LocalDate checkInFrom,
                                 @Param("checkInTo") LocalDate checkInTo,
                                 @Param("bookingStatus") BookingStatus bookingStatus,
                                 @Param("paymentStatus") PaymentStatus paymentStatus,
                                 Pageable pageable);

    /**
     * Returns true if there is any booking for the given room whose date range
     * overlaps with [checkIn, checkOut).
     * An optional excludeBookingId is passed when updating so the booking being
     * updated does not conflict with itself.
     */
    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "WHERE b.room.id = :roomId " +
           "AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId) " +
           "AND b.checkInDate < :checkOutDate " +
           "AND b.checkOutDate > :checkInDate")
    boolean existsOverlappingBooking(@Param("roomId") Long roomId,
                                     @Param("checkInDate") LocalDate checkInDate,
                                     @Param("checkOutDate") LocalDate checkOutDate,
                                     @Param("excludeBookingId") Long excludeBookingId);
}
