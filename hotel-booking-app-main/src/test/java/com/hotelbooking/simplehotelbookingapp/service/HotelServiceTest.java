package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.HotelRequest;
import com.hotelbooking.simplehotelbookingapp.dto.HotelResponse;
import com.hotelbooking.simplehotelbookingapp.dto.PagedResponse;
import com.hotelbooking.simplehotelbookingapp.entity.Hotel;
import com.hotelbooking.simplehotelbookingapp.entity.HotelType;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.HotelRepository;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private HotelService hotelService;

    private Hotel hotel;
    private HotelRequest hotelRequest;
    private HotelRequest minimalHotelRequest;

    @BeforeEach
    void setUp() {
        // Full hotel entity
        hotel = new Hotel();
        hotel.setId(1L);
        hotel.setName("Grand Hotel");
        hotel.setLocation("New York");
        hotel.setDescription("A grand hotel in the heart of New York.");
        hotel.setAddress("100 Park Ave");
        hotel.setCity("New York");
        hotel.setState("New York");
        hotel.setCountry("USA");
        hotel.setPhoneNumber("+1-212-000-0000");
        hotel.setEmail("info@grandhotel.com");
        hotel.setStarRating(5);
        hotel.setHotelType(HotelType.LUXURY);
        hotel.setCheckInTime(LocalTime.of(14, 0));
        hotel.setCheckOutTime(LocalTime.of(11, 0));
        hotel.setAmenities(List.of("WiFi", "Pool", "Gym"));
        hotel.setIsActive(Boolean.TRUE);
        hotel.setImageData(null);

        // Full request
        hotelRequest = new HotelRequest(
                "Grand Hotel", "New York",
                "A grand hotel in the heart of New York.",
                "100 Park Ave", "New York", "New York", "USA",
                "+1-212-000-0000", "info@grandhotel.com",
                5, HotelType.LUXURY,
                "14:00", "11:00",
                null, null,                   // imageBase64, imageContentType — null for tests
                List.of("WiFi", "Pool", "Gym"),
                Boolean.TRUE
        );

        // Minimal request (only required fields)
        minimalHotelRequest = new HotelRequest(
                "Budget Inn", "Chicago",
                null, null, null, null, null,
                null, null,
                null, null,
                null, null, null, null,
                null, null
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testCreateHotel_WithAllFields_Success() {
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotel);

        HotelResponse response = hotelService.createHotel(hotelRequest);

        assertNotNull(response);
        assertEquals("Grand Hotel", response.getName());
        assertEquals("New York", response.getLocation());
        assertEquals("A grand hotel in the heart of New York.", response.getDescription());
        assertEquals("New York", response.getCity());
        assertEquals("USA", response.getCountry());
        assertEquals(5, response.getStarRating());
        assertEquals(HotelType.LUXURY, response.getHotelType());
        assertEquals("14:00", response.getCheckInTime());
        assertEquals("11:00", response.getCheckOutTime());
        assertEquals(List.of("WiFi", "Pool", "Gym"), response.getAmenities());
        assertTrue(response.getIsActive());
        assertFalse(response.getHasImage());
        verify(hotelRepository, times(1)).save(any(Hotel.class));
    }

    @Test
    void testCreateHotel_WithMinimalFields_Success() {
        Hotel minimalHotel = new Hotel();
        minimalHotel.setId(2L);
        minimalHotel.setName("Budget Inn");
        minimalHotel.setLocation("Chicago");
        minimalHotel.setIsActive(Boolean.TRUE);

        when(hotelRepository.save(any(Hotel.class))).thenReturn(minimalHotel);

        HotelResponse response = hotelService.createHotel(minimalHotelRequest);

        assertNotNull(response);
        assertEquals("Budget Inn", response.getName());
        assertEquals("Chicago", response.getLocation());
        assertNull(response.getDescription());
        assertNull(response.getStarRating());
        assertNull(response.getHotelType());
        assertNull(response.getCheckInTime());
        assertNull(response.getCheckOutTime());
        verify(hotelRepository, times(1)).save(any(Hotel.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testGetHotelById_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        HotelResponse response = hotelService.getHotelById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Grand Hotel", response.getName());
        assertEquals(HotelType.LUXURY, response.getHotelType());
        assertEquals("14:00", response.getCheckInTime());
        verify(hotelRepository, times(1)).findById(1L);
    }

    @Test
    void testGetHotelById_NotFound() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.getHotelById(99L));
        verify(hotelRepository, times(1)).findById(99L);
    }

    @Test
    void testGetHotelByName_Success() {
        when(hotelRepository.findByName("Grand Hotel")).thenReturn(Optional.of(hotel));

        HotelResponse response = hotelService.getHotelByName("Grand Hotel");

        assertNotNull(response);
        assertEquals("Grand Hotel", response.getName());
        assertEquals("info@grandhotel.com", response.getEmail());
        verify(hotelRepository, times(1)).findByName("Grand Hotel");
    }

    @Test
    void testGetHotelByName_NotFound() {
        when(hotelRepository.findByName("Unknown Hotel")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.getHotelByName("Unknown Hotel"));
    }

    @Test
    void testGetAllHotels_NoFilters_ReturnsAll() {
        Hotel hotel2 = new Hotel();
        hotel2.setId(2L);
        hotel2.setName("Hotel Paradise");
        hotel2.setLocation("Miami");
        hotel2.setHotelType(HotelType.RESORT);
        hotel2.setStarRating(4);
        hotel2.setIsActive(Boolean.TRUE);

        Page<Hotel> page = new PageImpl<>(List.of(hotel, hotel2));

        when(hotelRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(),
                any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<HotelResponse> response = hotelService.getAllHotels(
                0, 10, "name", "asc",
                null, null, null, null, null, null, null);

        assertEquals(2, response.getContent().size());
        assertEquals("Grand Hotel", response.getContent().get(0).getName());
        assertEquals("Hotel Paradise", response.getContent().get(1).getName());
    }

    @Test
    void testGetAllHotels_FilterByStarRatingAndType() {
        Page<Hotel> page = new PageImpl<>(List.of(hotel));

        when(hotelRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(),
                eq(5), eq(HotelType.LUXURY), isNull(),
                any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<HotelResponse> response = hotelService.getAllHotels(
                0, 10, "name", "asc",
                null, null, null, null, 5, HotelType.LUXURY, null);

        assertEquals(1, response.getContent().size());
        assertEquals(5, response.getContent().get(0).getStarRating());
        assertEquals(HotelType.LUXURY, response.getContent().get(0).getHotelType());
    }

    @Test
    void testGetAllHotels_FilterByActiveStatus() {
        Page<Hotel> page = new PageImpl<>(List.of(hotel));

        when(hotelRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), eq(Boolean.TRUE),
                any(Pageable.class)))
                .thenReturn(page);

        PagedResponse<HotelResponse> response = hotelService.getAllHotels(
                0, 10, "name", "asc",
                null, null, null, null, null, null, Boolean.TRUE);

        assertEquals(1, response.getContent().size());
        assertTrue(response.getContent().get(0).getIsActive());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testUpdateHotel_Success() {
        HotelRequest updateRequest = new HotelRequest(
                "Updated Grand Hotel", "Los Angeles",
                "Updated description.", "200 Sunset Blvd",
                "Los Angeles", "California", "USA",
                "+1-310-000-0000", "info@updated.com",
                4, HotelType.BUSINESS,
                "15:00", "12:00",
                null, null,
                List.of("WiFi", "Gym"),
                Boolean.TRUE
        );

        Hotel updatedHotel = new Hotel();
        updatedHotel.setId(1L);
        updatedHotel.setName("Updated Grand Hotel");
        updatedHotel.setLocation("Los Angeles");
        updatedHotel.setCity("Los Angeles");
        updatedHotel.setCountry("USA");
        updatedHotel.setStarRating(4);
        updatedHotel.setHotelType(HotelType.BUSINESS);
        updatedHotel.setCheckInTime(LocalTime.of(15, 0));
        updatedHotel.setCheckOutTime(LocalTime.of(12, 0));
        updatedHotel.setAmenities(List.of("WiFi", "Gym"));
        updatedHotel.setIsActive(Boolean.TRUE);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(updatedHotel);

        HotelResponse response = hotelService.updateHotel(1L, updateRequest);

        assertNotNull(response);
        assertEquals("Updated Grand Hotel", response.getName());
        assertEquals("Los Angeles", response.getLocation());
        assertEquals(4, response.getStarRating());
        assertEquals(HotelType.BUSINESS, response.getHotelType());
        assertEquals("15:00", response.getCheckInTime());
        assertEquals("12:00", response.getCheckOutTime());
        verify(hotelRepository, times(1)).findById(1L);
        verify(hotelRepository, times(1)).save(any(Hotel.class));
    }

    @Test
    void testUpdateHotel_NotFound() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.updateHotel(99L, hotelRequest));
        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testDeleteHotel_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        hotelService.deleteHotel(1L);

        verify(hotelRepository, times(1)).findById(1L);
        verify(hotelRepository, times(1)).delete(hotel);
    }

    @Test
    void testDeleteHotel_NotFound() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.deleteHotel(99L));
        verify(hotelRepository, never()).delete(any(Hotel.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE HANDLING
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testCreateHotel_WithImageBase64_StoredAndReturnedCorrectly() {
        String originalText  = "SampleImageData";
        String base64Encoded = java.util.Base64.getEncoder().encodeToString(originalText.getBytes());

        Hotel hotelWithImage = new Hotel();
        hotelWithImage.setId(3L);
        hotelWithImage.setName("Image Hotel");
        hotelWithImage.setLocation("Paris");
        hotelWithImage.setIsActive(Boolean.TRUE);
        hotelWithImage.setImageData(originalText.getBytes());
        hotelWithImage.setImageContentType("image/jpeg");

        HotelRequest requestWithImage = new HotelRequest(
                "Image Hotel", "Paris",
                null, null, null, null, null,
                null, null, null, null,
                null, null,
                base64Encoded, "image/jpeg",
                null, Boolean.TRUE
        );

        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotelWithImage);

        HotelResponse response = hotelService.createHotel(requestWithImage);

        assertTrue(response.getHasImage());
        assertEquals("image/jpeg", hotelWithImage.getImageContentType());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MULTIPART IMAGE UPLOAD / GET / DELETE
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testUploadImage_Success() throws Exception {
        byte[] imageBytes = "FakeImageBytes".getBytes();
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file", "hotel.jpg", "image/jpeg", imageBytes);

        Hotel hotelWithImage = new Hotel();
        hotelWithImage.setId(1L);
        hotelWithImage.setName("Grand Hotel");
        hotelWithImage.setLocation("New York");
        hotelWithImage.setImageData(imageBytes);
        hotelWithImage.setImageContentType("image/jpeg");
        hotelWithImage.setIsActive(Boolean.TRUE);

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotelWithImage);

        HotelResponse response = hotelService.uploadImage(1L, multipartFile);

        assertNotNull(response);
        assertTrue(response.getHasImage());
        assertEquals("image/jpeg", hotelWithImage.getImageContentType());
        verify(hotelRepository, times(1)).save(any(Hotel.class));
    }

    @Test
    void testUploadImage_HotelNotFound_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "hotel.jpg", "image/jpeg", "bytes".getBytes());
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.uploadImage(99L, file));
    }

    @Test
    void testUploadImage_InvalidFileType_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "pdfbytes".getBytes());

        // No repo stub needed — service validates content type before touching the DB
        assertThrows(IllegalArgumentException.class, () -> hotelService.uploadImage(1L, file));
    }

    @Test
    void testUploadImage_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> hotelService.uploadImage(1L, emptyFile));
    }

    @Test
    void testGetImage_Success() {
        byte[] imageBytes = "FakeImageBytes".getBytes();
        hotel.setImageData(imageBytes);
        hotel.setImageContentType("image/png");
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        HotelService.HotelImage image = hotelService.getImage(1L);

        assertNotNull(image);
        assertArrayEquals(imageBytes, image.data());
        assertEquals("image/png", image.contentType());
    }

    @Test
    void testGetImage_NoImageUploaded_ThrowsException() {
        hotel.setImageData(null);
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        assertThrows(ResourceNotFoundException.class, () -> hotelService.getImage(1L));
    }

    @Test
    void testDeleteImage_Success() {
        hotel.setImageData("someBytes".getBytes());
        hotel.setImageContentType("image/jpeg");
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotel);

        hotelService.deleteImage(1L);

        verify(hotelRepository, times(1)).save(any(Hotel.class));
        assertNull(hotel.getImageData());
        assertNull(hotel.getImageContentType());
    }

    @Test
    void testDeleteImage_HotelNotFound_ThrowsException() {
        when(hotelRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.deleteImage(99L));
        verify(hotelRepository, never()).save(any(Hotel.class));
    }
}

