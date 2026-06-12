package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RoomRequest;
import com.hotelbooking.simplehotelbookingapp.dto.RoomResponse;
import com.hotelbooking.simplehotelbookingapp.entity.Hotel;
import com.hotelbooking.simplehotelbookingapp.entity.Room;
import com.hotelbooking.simplehotelbookingapp.entity.RoomStatus;
import com.hotelbooking.simplehotelbookingapp.entity.RoomType;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.HotelRepository;
import com.hotelbooking.simplehotelbookingapp.repository.RoomRepository;
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
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    private static final Set<String> VALID_SORT_FIELDS = Set.of(
            "id", "roomNumber", "price", "weekendPrice", "roomType",
            "bedType", "maxOccupancy", "floorNumber", "roomSizeInSqFt", "status"
    );

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    public RoomResponse createRoom(RoomRequest request) {
        Hotel hotel = findHotelOrThrow(request.getHotelId());
        Room room = mapToEntity(new Room(), request, hotel);
        Room saved = roomRepository.save(room);
        logger.info("Room created: {} (ID: {}) in hotel {}", request.getRoomNumber(), saved.getId(), request.getHotelId());
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        return mapToResponse(findRoomOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByHotelId(Long hotelId) {
        findHotelOrThrow(hotelId);
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        if (rooms.isEmpty()) {
            throw new ResourceNotFoundException("No rooms found for hotel ID: " + hotelId);
        }
        return rooms.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<RoomResponse> getAllRooms(int page,
                                                   int size,
                                                   String sortBy,
                                                   String sortDir,
                                                   Long hotelId,
                                                   String roomNumber,
                                                   BigDecimal minPrice,
                                                   BigDecimal maxPrice,
                                                   RoomType roomType,
                                                   RoomStatus status,
                                                   Boolean isActive) {
        int safePage    = Math.max(page, 0);
        int safeSize    = Math.min(Math.max(size, 1), 100);
        String safeSort = VALID_SORT_FIELDS.contains(sortBy) ? sortBy : "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort));
        Page<RoomResponse> roomPage = roomRepository.searchRooms(
                        hotelId,
                        blankToNull(roomNumber),
                        minPrice,
                        maxPrice,
                        roomType,
                        status,
                        isActive,
                        pageable)
                .map(this::mapToResponse);

        return new PagedResponse<>(
                roomPage.getContent(),
                roomPage.getNumber(),
                roomPage.getSize(),
                roomPage.getTotalElements(),
                roomPage.getTotalPages(),
                roomPage.isLast()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = findRoomOrThrow(id);
        mapToEntity(room, request, room.getHotel()); // hotel cannot be changed on update
        Room updated = roomRepository.save(room);
        logger.info("Room ID {} updated: {}", id, request.getRoomNumber());
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    public void deleteRoom(Long id) {
        Room room = findRoomOrThrow(id);
        roomRepository.delete(room);
        logger.info("Room ID {} deleted", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE UPLOAD / RETRIEVE / DELETE
    // ─────────────────────────────────────────────────────────────────────────

    public RoomResponse uploadImage(Long id, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Invalid file type '" + contentType + "'. Only image files are accepted.");
        }
        Room room = findRoomOrThrow(id);
        room.setImageData(file.getBytes());
        room.setImageContentType(contentType);
        Room saved = roomRepository.save(room);
        logger.info("Image uploaded for Room ID {}: {} bytes, type={}", id, file.getSize(), contentType);
        return mapToResponse(saved);
    }

    /** Holder for raw image bytes + MIME type, used by the image download endpoint. */
    public record RoomImage(byte[] data, String contentType) {}

    @Transactional(readOnly = true)
    public RoomImage getImage(Long id) {
        Room room = findRoomOrThrow(id);
        if (room.getImageData() == null || room.getImageData().length == 0) {
            throw new ResourceNotFoundException("No image found for room with ID: " + id);
        }
        String ct = room.getImageContentType() != null ? room.getImageContentType() : "application/octet-stream";
        return new RoomImage(room.getImageData(), ct);
    }

    public void deleteImage(Long id) {
        Room room = findRoomOrThrow(id);
        room.setImageData(null);
        room.setImageContentType(null);
        roomRepository.save(room);
        logger.info("Image removed for Room ID {}", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Room findRoomOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
    }

    private Hotel findHotelOrThrow(Long hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
    }

    private Room mapToEntity(Room room, RoomRequest request, Hotel hotel) {
        room.setRoomNumber(request.getRoomNumber());
        room.setPrice(request.getPrice());
        room.setHotel(hotel);
        room.setDescription(request.getDescription());
        room.setRoomType(request.getRoomType());
        room.setBedType(request.getBedType());
        room.setMaxOccupancy(request.getMaxOccupancy());
        room.setFloorNumber(request.getFloorNumber());
        room.setRoomSizeInSqFt(request.getRoomSizeInSqFt());
        room.setViewType(request.getViewType());
        room.setWeekendPrice(request.getWeekendPrice());
        room.setStatus(request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE);
        room.setIsActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);

        if (request.getAmenities() != null) {
            room.setAmenities(new ArrayList<>(request.getAmenities()));
        }
        if (request.getImageBase64() != null && !request.getImageBase64().isBlank()) {
            room.setImageData(Base64.getDecoder().decode(request.getImageBase64()));
            room.setImageContentType(
                    request.getImageContentType() != null ? request.getImageContentType() : "image/jpeg");
        }
        return room;
    }

    private RoomResponse mapToResponse(Room room) {
        boolean hasImage = room.getImageData() != null && room.getImageData().length > 0;
        List<String> amenities = room.getAmenities() != null
                ? new ArrayList<>(room.getAmenities())
                : new ArrayList<>();
        String hotelName = room.getHotel() != null ? room.getHotel().getName() : null;

        return new RoomResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getPrice(),
                room.getHotel().getId(),
                hotelName,
                room.getDescription(),
                room.getRoomType(),
                room.getBedType(),
                room.getMaxOccupancy(),
                room.getFloorNumber(),
                room.getRoomSizeInSqFt(),
                room.getViewType(),
                room.getWeekendPrice(),
                amenities,
                room.getStatus(),
                room.getIsActive(),
                hasImage,
                room.getCreatedAt(),
                room.getUpdatedAt()
        );
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
