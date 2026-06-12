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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock private RoomRepository roomRepository;
    @Mock private HotelRepository hotelRepository;
    @InjectMocks private RoomService roomService;

    private Room room;
    private Hotel hotel;
    private RoomRequest roomRequest;
    private RoomRequest minimalRoomRequest;

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
        room.setHotel(hotel);
        room.setDescription("Elegant room with city view.");
        room.setRoomType(RoomType.SUITE);
        room.setBedType("KING");
        room.setMaxOccupancy(2);
        room.setFloorNumber(3);
        room.setRoomSizeInSqFt(450.0);
        room.setViewType("CITY");
        room.setWeekendPrice(new BigDecimal("200.00"));
        room.setAmenities(List.of("AC", "TV", "Mini Bar"));
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsActive(Boolean.TRUE);
        room.setImageData(null);

        // Full request with all fields
        roomRequest = new RoomRequest(
                "101", new BigDecimal("150.00"), 1L,
                "Elegant room with city view.",
                RoomType.SUITE, "KING", 2, 3, 450.0, "CITY",
                new BigDecimal("200.00"),
                List.of("AC", "TV", "Mini Bar"),
                RoomStatus.AVAILABLE, Boolean.TRUE,
                null, null
        );

        // Minimal request — only required fields
        minimalRoomRequest = new RoomRequest(
                "102", new BigDecimal("100.00"), 1L,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testCreateRoom_WithAllFields_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        RoomResponse response = roomService.createRoom(roomRequest);

        assertNotNull(response);
        assertEquals("101", response.getRoomNumber());
        assertEquals(new BigDecimal("150.00"), response.getPrice());
        assertEquals(1L, response.getHotelId());
        assertEquals("Elegant room with city view.", response.getDescription());
        assertEquals(RoomType.SUITE, response.getRoomType());
        assertEquals("KING", response.getBedType());
        assertEquals(2, response.getMaxOccupancy());
        assertEquals(3, response.getFloorNumber());
        assertEquals(450.0, response.getRoomSizeInSqFt());
        assertEquals("CITY", response.getViewType());
        assertEquals(new BigDecimal("200.00"), response.getWeekendPrice());
        assertEquals(List.of("AC", "TV", "Mini Bar"), response.getAmenities());
        assertEquals(RoomStatus.AVAILABLE, response.getStatus());
        assertTrue(response.getIsActive());
        assertFalse(response.getHasImage());
        assertEquals("Grand Hotel", response.getHotelName());
        verify(hotelRepository, times(1)).findById(1L);
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void testCreateRoom_WithMinimalFields_Success() {
        Room minimal = new Room();
        minimal.setId(2L);
        minimal.setRoomNumber("102");
        minimal.setPrice(new BigDecimal("100.00"));
        minimal.setHotel(hotel);
        minimal.setStatus(RoomStatus.AVAILABLE);
        minimal.setIsActive(Boolean.TRUE);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.save(any(Room.class))).thenReturn(minimal);

        RoomResponse response = roomService.createRoom(minimalRoomRequest);

        assertNotNull(response);
        assertEquals("102", response.getRoomNumber());
        assertNull(response.getDescription());
        assertNull(response.getRoomType());
        assertNull(response.getBedType());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void testCreateRoom_HotelNotFound() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.createRoom(roomRequest));
        verify(roomRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testGetRoomById_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        RoomResponse response = roomService.getRoomById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("101", response.getRoomNumber());
        assertEquals(RoomType.SUITE, response.getRoomType());
        assertEquals(RoomStatus.AVAILABLE, response.getStatus());
        verify(roomRepository, times(1)).findById(1L);
    }

    @Test
    void testGetRoomById_NotFound() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.getRoomById(99L));
    }

    @Test
    void testGetRoomsByHotelId_Success() {
        Room room2 = new Room();
        room2.setId(2L);
        room2.setRoomNumber("102");
        room2.setPrice(new BigDecimal("160.00"));
        room2.setHotel(hotel);
        room2.setStatus(RoomStatus.AVAILABLE);
        room2.setIsActive(Boolean.TRUE);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.findByHotelId(1L)).thenReturn(List.of(room, room2));

        List<RoomResponse> responses = roomService.getRoomsByHotelId(1L);

        assertEquals(2, responses.size());
        assertEquals("101", responses.get(0).getRoomNumber());
        assertEquals("102", responses.get(1).getRoomNumber());
    }

    @Test
    void testGetRoomsByHotelId_HotelNotFound() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.getRoomsByHotelId(99L));
    }

    @Test
    void testGetRoomsByHotelId_NoRoomsFound() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.findByHotelId(1L)).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, () -> roomService.getRoomsByHotelId(1L));
    }

    @Test
    void testGetAllRooms_NoFilters_ReturnsAll() {
        Room room2 = new Room();
        room2.setId(2L);
        room2.setRoomNumber("102");
        room2.setPrice(new BigDecimal("160.00"));
        room2.setHotel(hotel);
        room2.setStatus(RoomStatus.AVAILABLE);
        room2.setIsActive(Boolean.TRUE);

        Page<Room> page = new PageImpl<>(List.of(room, room2));
        when(roomRepository.searchRooms(isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), any(Pageable.class))).thenReturn(page);

        PagedResponse<RoomResponse> response = roomService.getAllRooms(
                0, 10, "id", "asc",
                null, null, null, null, null, null, null);

        assertEquals(2, response.getContent().size());
        verify(roomRepository, times(1)).searchRooms(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void testGetAllRooms_FilterByRoomTypeAndStatus() {
        Page<Room> page = new PageImpl<>(List.of(room));
        when(roomRepository.searchRooms(isNull(), isNull(), isNull(), isNull(),
                eq(RoomType.SUITE), eq(RoomStatus.AVAILABLE), isNull(), any(Pageable.class))).thenReturn(page);

        PagedResponse<RoomResponse> response = roomService.getAllRooms(
                0, 10, "id", "asc",
                null, null, null, null, RoomType.SUITE, RoomStatus.AVAILABLE, null);

        assertEquals(1, response.getContent().size());
        assertEquals(RoomType.SUITE, response.getContent().get(0).getRoomType());
        assertEquals(RoomStatus.AVAILABLE, response.getContent().get(0).getStatus());
    }

    @Test
    void testGetAllRooms_FilterByPriceRange() {
        Page<Room> page = new PageImpl<>(List.of(room));
        when(roomRepository.searchRooms(isNull(), isNull(),
                eq(new BigDecimal("100.00")), eq(new BigDecimal("200.00")),
                isNull(), isNull(), isNull(), any(Pageable.class))).thenReturn(page);

        PagedResponse<RoomResponse> response = roomService.getAllRooms(
                0, 10, "price", "asc",
                null, null, new BigDecimal("100.00"), new BigDecimal("200.00"),
                null, null, null);

        assertEquals(1, response.getContent().size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testUpdateRoom_Success() {
        RoomRequest updateRequest = new RoomRequest(
                "101-UPD", new BigDecimal("180.00"), 1L,
                "Updated description.", RoomType.DELUXE, "QUEEN",
                2, 4, 380.0, "OCEAN", new BigDecimal("220.00"),
                List.of("AC", "TV"), RoomStatus.AVAILABLE, Boolean.TRUE, null, null
        );

        Room updated = new Room();
        updated.setId(1L);
        updated.setRoomNumber("101-UPD");
        updated.setPrice(new BigDecimal("180.00"));
        updated.setHotel(hotel);
        updated.setRoomType(RoomType.DELUXE);
        updated.setBedType("QUEEN");
        updated.setStatus(RoomStatus.AVAILABLE);
        updated.setIsActive(Boolean.TRUE);
        updated.setAmenities(List.of("AC", "TV"));

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenReturn(updated);

        RoomResponse response = roomService.updateRoom(1L, updateRequest);

        assertNotNull(response);
        assertEquals("101-UPD", response.getRoomNumber());
        assertEquals(new BigDecimal("180.00"), response.getPrice());
        assertEquals(RoomType.DELUXE, response.getRoomType());
        verify(roomRepository, times(1)).findById(1L);
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void testUpdateRoom_NotFound() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.updateRoom(99L, roomRequest));
        verify(roomRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testDeleteRoom_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        roomService.deleteRoom(1L);

        verify(roomRepository, times(1)).findById(1L);
        verify(roomRepository, times(1)).delete(room);
    }

    @Test
    void testDeleteRoom_NotFound() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.deleteRoom(99L));
        verify(roomRepository, never()).delete(any(Room.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE UPLOAD / GET / DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testUploadImage_Success() throws Exception {
        byte[] imageBytes = "FakeRoomImageBytes".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "room.jpg", "image/jpeg", imageBytes);

        Room roomWithImage = new Room();
        roomWithImage.setId(1L);
        roomWithImage.setRoomNumber("101");
        roomWithImage.setPrice(new BigDecimal("150.00"));
        roomWithImage.setHotel(hotel);
        roomWithImage.setImageData(imageBytes);
        roomWithImage.setImageContentType("image/jpeg");
        roomWithImage.setStatus(RoomStatus.AVAILABLE);
        roomWithImage.setIsActive(Boolean.TRUE);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenReturn(roomWithImage);

        RoomResponse response = roomService.uploadImage(1L, file);

        assertNotNull(response);
        assertTrue(response.getHasImage());
        assertEquals("image/jpeg", roomWithImage.getImageContentType());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void testUploadImage_RoomNotFound_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "room.jpg", "image/jpeg", "bytes".getBytes());
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.uploadImage(99L, file));
    }

    @Test
    void testUploadImage_InvalidFileType_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", "bytes".getBytes());

        // validation fires before DB lookup
        assertThrows(IllegalArgumentException.class, () -> roomService.uploadImage(1L, file));
    }

    @Test
    void testUploadImage_EmptyFile_ThrowsException() {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> roomService.uploadImage(1L, empty));
    }

    @Test
    void testGetImage_Success() {
        byte[] imageBytes = "RoomImageData".getBytes();
        room.setImageData(imageBytes);
        room.setImageContentType("image/png");
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        RoomService.RoomImage image = roomService.getImage(1L);

        assertNotNull(image);
        assertArrayEquals(imageBytes, image.data());
        assertEquals("image/png", image.contentType());
    }

    @Test
    void testGetImage_NoImageUploaded_ThrowsException() {
        room.setImageData(null);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        assertThrows(ResourceNotFoundException.class, () -> roomService.getImage(1L));
    }

    @Test
    void testDeleteImage_Success() {
        room.setImageData("bytes".getBytes());
        room.setImageContentType("image/jpeg");
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        roomService.deleteImage(1L);

        verify(roomRepository, times(1)).save(any(Room.class));
        assertNull(room.getImageData());
        assertNull(room.getImageContentType());
    }

    @Test
    void testDeleteImage_RoomNotFound_ThrowsException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.deleteImage(99L));
        verify(roomRepository, never()).save(any(Room.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BASE64 IMAGE VIA JSON REQUEST
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testCreateRoom_WithImageBase64_StoredAndReturnedCorrectly() {
        String text = "SampleRoomImage";
        String base64 = java.util.Base64.getEncoder().encodeToString(text.getBytes());

        Room roomWithImage = new Room();
        roomWithImage.setId(3L);
        roomWithImage.setRoomNumber("201");
        roomWithImage.setPrice(new BigDecimal("250.00"));
        roomWithImage.setHotel(hotel);
        roomWithImage.setImageData(text.getBytes());
        roomWithImage.setImageContentType("image/jpeg");
        roomWithImage.setStatus(RoomStatus.AVAILABLE);
        roomWithImage.setIsActive(Boolean.TRUE);

        RoomRequest req = new RoomRequest(
                "201", new BigDecimal("250.00"), 1L,
                null, null, null, null, null, null, null,
                null, null, null, Boolean.TRUE, base64, "image/jpeg"
        );

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.save(any(Room.class))).thenReturn(roomWithImage);

        RoomResponse response = roomService.createRoom(req);

        assertNotNull(response.getHasImage());
        assertTrue(response.getHasImage());
        assertEquals("image/jpeg", roomWithImage.getImageContentType());
    }
}
