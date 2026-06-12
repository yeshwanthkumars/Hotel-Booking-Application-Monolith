package com.hotelbooking.simplehotelbookingapp.repository;

import com.hotelbooking.simplehotelbookingapp.entity.Hotel;
import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Optional<Hotel> findByName(String name);

    List<Hotel> findByLocation(String location);

    /**
     * Dynamic filtered search across all new hotel fields with pagination support.
     * All filter parameters are optional — null means "no filter on this field".
     */
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:location IS NULL OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:city IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:country IS NULL OR LOWER(h.country) LIKE LOWER(CONCAT('%', :country, '%'))) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:hotelType IS NULL OR h.hotelType = :hotelType) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive)")
    Page<Hotel> findWithFilters(
            @Param("name")       String name,
            @Param("location")   String location,
            @Param("city")       String city,
            @Param("country")    String country,
            @Param("starRating") Integer starRating,
            @Param("hotelType")  HotelType hotelType,
            @Param("isActive")   Boolean isActive,
            Pageable pageable);
}
