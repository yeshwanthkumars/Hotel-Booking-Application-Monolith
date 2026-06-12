package com.hotelbooking.simplehotelbookingapp.config;

import com.hotelbooking.simplehotelbookingapp.repository.HotelRepository;
import com.hotelbooking.simplehotelbookingapp.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

/**
 * Downloads professional hotel/room images from Unsplash at application startup
 * and stores them as BLOBs in the database — identical to an admin uploading via UI.
 *
 * Skips any record that already has imageData (safe on restart).
 * Fails gracefully: a download error logs a warning and does NOT crash the app.
 * Excluded from the "test" profile so unit tests are unaffected.
 */
@Component
@RequiredArgsConstructor
@Profile("!test")
public class ImageSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ImageSeeder.class);

    private static final String CONTENT_TYPE    = "image/jpeg";
    private static final int    CONNECT_TIMEOUT = 8_000;
    private static final int    READ_TIMEOUT    = 15_000;

    // Hotel name (must match data.sql exactly) → Unsplash image URL
    private static final Map<String, String> HOTEL_IMAGES = Map.of(
        "Taj Hotel",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
        "The Plaza Hotel",
            "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1200&auto=format&fit=crop&q=80",
        "Marina Bay Sands",
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80"
    );

    // Room number (must match data.sql exactly) → Unsplash image URL
    private static final Map<String, String> ROOM_IMAGES = Map.of(
        "101", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80",
        "102", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80",
        "201", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "202", "https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800&auto=format&fit=crop&q=80",
        "301", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
        "302", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80"
    );

    private final HotelRepository hotelRepository;
    private final RoomRepository  roomRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("ImageSeeder — seeding default hotel and room images...");
        seedHotelImages();
        seedRoomImages();
        log.info("ImageSeeder — completed.");
    }

    private void seedHotelImages() {
        HOTEL_IMAGES.forEach((name, url) ->
            hotelRepository.findByName(name).ifPresentOrElse(hotel -> {
                if (hotel.getImageData() != null && hotel.getImageData().length > 0) {
                    log.debug("Hotel '{}' already has an image — skipping.", name);
                    return;
                }
                byte[] bytes = download(url, "hotel:" + name);
                if (bytes != null) {
                    hotel.setImageData(bytes);
                    hotel.setImageContentType(CONTENT_TYPE);
                    hotelRepository.save(hotel);
                    log.info("Hotel '{}' — image seeded ({} bytes).", name, bytes.length);
                }
            }, () -> log.warn("Hotel '{}' not found in DB — skipping image seed.", name))
        );
    }

    private void seedRoomImages() {
        ROOM_IMAGES.forEach((roomNumber, url) ->
            roomRepository.findByRoomNumber(roomNumber).ifPresentOrElse(room -> {
                if (room.getImageData() != null && room.getImageData().length > 0) {
                    log.debug("Room '{}' already has an image — skipping.", roomNumber);
                    return;
                }
                byte[] bytes = download(url, "room:" + roomNumber);
                if (bytes != null) {
                    room.setImageData(bytes);
                    room.setImageContentType(CONTENT_TYPE);
                    roomRepository.save(room);
                    log.info("Room '{}' — image seeded ({} bytes).", roomNumber, bytes.length);
                }
            }, () -> log.warn("Room '{}' not found in DB — skipping image seed.", roomNumber))
        );
    }

    /**
     * Downloads bytes from the given URL, following one redirect if needed
     * (Unsplash returns HTTP 302 → actual CDN URL).
     * Returns null on any error — never throws.
     */
    private byte[] download(String imageUrl, String label) {
        try {
            HttpURLConnection conn = openConnection(imageUrl);
            int status = conn.getResponseCode();
            if (status == 301 || status == 302 || status == 307 || status == 308) {
                String location = conn.getHeaderField("Location");
                conn.disconnect();
                conn = openConnection(location);
            }
            try (InputStream in = conn.getInputStream()) {
                return in.readAllBytes();
            } finally {
                conn.disconnect();
            }
        } catch (Exception e) {
            log.warn("ImageSeeder — could not download image for [{}]: {}. " +
                     "App starts normally; image can be uploaded manually via UI.", label, e.getMessage());
            return null;
        }
    }

    private HttpURLConnection openConnection(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(CONNECT_TIMEOUT);
        conn.setReadTimeout(READ_TIMEOUT);
        conn.setRequestProperty("User-Agent", "SimpleHotelBookingApp/1.0");
        conn.connect();
        return conn;
    }
}

