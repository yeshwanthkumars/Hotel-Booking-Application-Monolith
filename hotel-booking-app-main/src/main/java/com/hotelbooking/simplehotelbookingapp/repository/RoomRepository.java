package com.hotelbooking.simplehotelbookingapp.repository;

import com.hotelbooking.simplehotelbookingapp.entity.Room;
import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotelId(Long hotelId);
    Optional<Room> findByRoomNumber(String roomNumber);
    Optional<Room> findByRoomNumberAndHotelId(String roomNumber, Long hotelId);

    /**
     * Dynamic filtered search supporting all room fields with pagination.
     * All filter parameters are optional — null means no filter on that field.
     */
    @Query("SELECT r FROM Room r WHERE " +
           "(:hotelId IS NULL OR r.hotel.id = :hotelId) " +
           "AND (:roomNumber IS NULL OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :roomNumber, '%'))) " +
           "AND (:minPrice IS NULL OR r.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR r.price <= :maxPrice) " +
           "AND (:roomType IS NULL OR r.roomType = :roomType) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:isActive IS NULL OR r.isActive = :isActive)")
    Page<Room> searchRooms(@Param("hotelId")    Long hotelId,
                           @Param("roomNumber") String roomNumber,
                           @Param("minPrice")   BigDecimal minPrice,
                           @Param("maxPrice")   BigDecimal maxPrice,
                           @Param("roomType")   RoomType roomType,
                           @Param("status")     RoomStatus status,
                           @Param("isActive")   Boolean isActive,
                           Pageable pageable);

    /**
     * Fetches a room by ID with a PESSIMISTIC_WRITE lock so that concurrent booking
     * requests for the same room are serialized at the DB level.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);
}
