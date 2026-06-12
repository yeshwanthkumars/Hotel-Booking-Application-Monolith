package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.HotelRequest;
import com.hotelbooking.simplehotelbookingapp.dto.HotelResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.Hotel;
import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class HotelService {

    private static final Logger logger = LoggerFactory.getLogger(HotelService.class);

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final Set<String> VALID_SORT_FIELDS = Set.of(
            "id", "name", "location", "city", "country", "starRating", "hotelType", "checkInTime"
    );

    private final HotelRepository hotelRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    public HotelResponse createHotel(HotelRequest request) {
        Hotel hotel = mapToEntity(new Hotel(), request);
        Hotel saved = hotelRepository.save(hotel);
        logger.info("Hotel created: {} (ID: {})", request.getName(), saved.getId());
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = findByIdOrThrow(id);
        return mapToResponse(hotel);
    }

    @Transactional(readOnly = true)
    public HotelResponse getHotelByName(String name) {
        Hotel hotel = hotelRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with name: " + name));
        return mapToResponse(hotel);
    }

    @Transactional(readOnly = true)
    public PagedResponse<HotelResponse> getAllHotels(int page,
                                                     int size,
                                                     String sortBy,
                                                     String sortDir,
                                                     String name,
                                                     String location,
                                                     String city,
                                                     String country,
                                                     Integer starRating,
                                                     HotelType hotelType,
                                                     Boolean isActive) {

        int safePage    = Math.max(page, 0);
        int safeSize    = Math.min(Math.max(size, 1), 100);
        String safeSort = VALID_SORT_FIELDS.contains(sortBy) ? sortBy : "name";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort));

        Page<HotelResponse> hotelPage = hotelRepository
                .findWithFilters(
                        blankToNull(name),
                        blankToNull(location),
                        blankToNull(city),
                        blankToNull(country),
                        starRating,
                        hotelType,
                        isActive,
                        pageable)
                .map(this::mapToResponse);

        return new PagedResponse<>(
                hotelPage.getContent(),
                hotelPage.getNumber(),
                hotelPage.getSize(),
                hotelPage.getTotalElements(),
                hotelPage.getTotalPages(),
                hotelPage.isLast()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = findByIdOrThrow(id);
        mapToEntity(hotel, request);
        Hotel updated = hotelRepository.save(hotel);
        logger.info("Hotel ID {} updated: {}", id, request.getName());
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    public void deleteHotel(Long id) {
        Hotel hotel = findByIdOrThrow(id);
        hotelRepository.delete(hotel);
        logger.info("Hotel ID {} deleted", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE UPLOAD / RETRIEVE / DELETE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts a multipart file from the UI and persists its bytes + content type
     * directly in the hotel row of the DB. Returns the updated hotel response.
     */
    public HotelResponse uploadImage(Long id, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Invalid file type '" + contentType + "'. Only image files are accepted.");
        }

        Hotel hotel = findByIdOrThrow(id);
        hotel.setImageData(file.getBytes());
        hotel.setImageContentType(contentType);

        Hotel saved = hotelRepository.save(hotel);
        logger.info("Image uploaded for Hotel ID {}: {} bytes, type={}", id, file.getSize(), contentType);
        return mapToResponse(saved);
    }

    /**
     * Holder for raw image bytes + MIME type, used by the image download endpoint.
     */
    public record HotelImage(byte[] data, String contentType) {}

    /**
     * Returns the raw image bytes and content type for the given hotel.
     * Throws {@link ResourceNotFoundException} if no image has been uploaded.
     */
    @Transactional(readOnly = true)
    public HotelImage getImage(Long id) {
        Hotel hotel = findByIdOrThrow(id);
        if (hotel.getImageData() == null || hotel.getImageData().length == 0) {
            throw new ResourceNotFoundException("No image found for hotel with ID: " + id);
        }
        String ct = hotel.getImageContentType() != null
                ? hotel.getImageContentType()
                : "application/octet-stream";
        return new HotelImage(hotel.getImageData(), ct);
    }

    /**
     * Removes the stored image (data + content type) for the given hotel.
     */
    public void deleteImage(Long id) {
        Hotel hotel = findByIdOrThrow(id);
        hotel.setImageData(null);
        hotel.setImageContentType(null);
        hotelRepository.save(hotel);
        logger.info("Image removed for Hotel ID {}", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Hotel findByIdOrThrow(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
    }

    /**
     * Maps all fields from {@link HotelRequest} onto a Hotel entity (create or update).
     * Returns the mutated entity for method chaining.
     */
    private Hotel mapToEntity(Hotel hotel, HotelRequest request) {
        hotel.setName(request.getName());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setState(request.getState());
        hotel.setCountry(request.getCountry());
        hotel.setPhoneNumber(request.getPhoneNumber());
        hotel.setEmail(request.getEmail());
        hotel.setStarRating(request.getStarRating());
        hotel.setHotelType(request.getHotelType());
        hotel.setCheckInTime(parseTime(request.getCheckInTime()));
        hotel.setCheckOutTime(parseTime(request.getCheckOutTime()));
        hotel.setIsActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);

        if (request.getImageBase64() != null && !request.getImageBase64().isBlank()) {
            hotel.setImageData(Base64.getDecoder().decode(request.getImageBase64()));
            hotel.setImageContentType(
                    request.getImageContentType() != null ? request.getImageContentType() : "image/jpeg");
        }


        if (request.getAmenities() != null) {
            hotel.setAmenities(new ArrayList<>(request.getAmenities()));
        }

        return hotel;
    }

    /**
     * Maps a Hotel entity to {@link HotelResponse}.
     * Image data is returned as a Base64-encoded string; null if no image is stored.
     */
    private HotelResponse mapToResponse(Hotel hotel) {
        boolean hasImage = hotel.getImageData() != null && hotel.getImageData().length > 0;

        List<String> amenities = hotel.getAmenities() != null
                ? new ArrayList<>(hotel.getAmenities())
                : new ArrayList<>();

        return new HotelResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                hotel.getAddress(),
                hotel.getCity(),
                hotel.getState(),
                hotel.getCountry(),
                hotel.getPhoneNumber(),
                hotel.getEmail(),
                hotel.getStarRating(),
                hotel.getHotelType(),
                formatTime(hotel.getCheckInTime()),
                formatTime(hotel.getCheckOutTime()),
                hasImage,
                amenities,
                hotel.getIsActive(),
                hotel.getCreatedAt(),
                hotel.getUpdatedAt()
        );
    }

    /** Parses "HH:mm" string to LocalTime; returns null if input is null/blank. */
    private LocalTime parseTime(String time) {
        if (time == null || time.isBlank()) return null;
        return LocalTime.parse(time, TIME_FORMATTER);
    }

    /** Formats LocalTime to "HH:mm"; returns null if input is null. */
    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : null;
    }

    /** Converts blank strings to null so JPQL IS NULL checks work correctly. */
    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
