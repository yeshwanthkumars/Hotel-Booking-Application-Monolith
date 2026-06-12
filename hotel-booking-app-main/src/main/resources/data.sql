-- ============================================================
-- Default Users (BCrypt of 'password')
-- ============================================================
INSERT INTO users (username, email, password, role) VALUES
('user',  'user@gmail.com',  '$2a$10$HJVL5omF71VmgyqTei0z9.IW/xHSEto3gEL8G177aY1xUtoPUrsoy', 'USER'),
('admin', 'admin@gmail.com', '$2a$10$HJVL5omF71VmgyqTei0z9.IW/xHSEto3gEL8G177aY1xUtoPUrsoy', 'ADMIN');

-- ============================================================
-- Default Hotels
-- ============================================================
INSERT INTO hotels (name, location, description, address, city, state, country, phone_number, email, star_rating, hotel_type, check_in_time, check_out_time, is_active, created_at, updated_at) VALUES
(
  'Taj Hotel',
  'Mumbai',
  'One of India''s most iconic luxury hotels overlooking the Gateway of India.',
  'Apollo Bunder, Colaba',
  'Mumbai', 'Maharashtra', 'India',
  '+91-22-6665-3366', 'reservations.tajmahal@tajhotels.com',
  5, 'LUXURY',
  '14:00:00', '12:00:00',
  TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'The Plaza Hotel',
  'New York',
  'A legendary luxury hotel at the corner of Fifth Avenue and Central Park South.',
  '768 5th Ave',
  'New York', 'New York', 'USA',
  '+1-212-759-3000', 'reservations@theplazany.com',
  5, 'LUXURY',
  '15:00:00', '12:00:00',
  TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'Marina Bay Sands',
  'Singapore',
  'An iconic integrated resort featuring a stunning rooftop infinity pool.',
  '10 Bayfront Ave',
  'Singapore', 'Singapore', 'Singapore',
  '+65-6688-8868', 'hotel@marinabaysands.com',
  5, 'RESORT',
  '15:00:00', '11:00:00',
  TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- ============================================================
-- Default Hotel Amenities
-- ============================================================
INSERT INTO hotel_amenities (hotel_id, amenity) VALUES
(1, 'Free WiFi'), (1, 'Swimming Pool'), (1, 'Spa'), (1, 'Gym'), (1, 'Restaurant'), (1, 'Concierge'), (1, 'Valet Parking'),
(2, 'Free WiFi'), (2, 'Swimming Pool'), (2, 'Gym'), (2, 'Bar'),  (2, 'Concierge'), (2, 'Room Service'), (2, 'Business Center'),
(3, 'Free WiFi'), (3, 'Infinity Pool'), (3, 'Casino'), (3, 'Spa'), (3, 'Multiple Restaurants'), (3, 'Shopping Mall'), (3, 'Sky Park');

-- ============================================================
-- Default Rooms
-- ============================================================
INSERT INTO rooms (room_number, price, description, room_type, bed_type, max_occupancy, floor_number, room_size_in_sq_ft, view_type, weekend_price, status, is_active, created_at, updated_at, hotel_id) VALUES
('101', 150.00, 'Elegant single room with city view.',                    'SINGLE', 'QUEEN', 1, 1, 250.0, 'CITY',   180.00, 'AVAILABLE',   TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('102', 200.00, 'Spacious double room with garden view.',                 'DOUBLE', 'KING',  2, 1, 320.0, 'GARDEN', 240.00, 'AVAILABLE',   TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('201', 250.00, 'Luxurious suite with panoramic city skyline.',           'SUITE',  'KING',  2, 3, 550.0, 'CITY',   320.00, 'AVAILABLE',   TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
('202', 300.00, 'Deluxe family room with two queen beds.',                'FAMILY', 'QUEEN', 4, 3, 680.0, 'GARDEN', 380.00, 'AVAILABLE',   TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
('301', 180.00, 'Contemporary room with stunning ocean view.',            'DOUBLE', 'QUEEN', 2, 5, 400.0, 'OCEAN',  220.00, 'AVAILABLE',   TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3),
('302', 220.00, 'Premium deluxe room overlooking the infinity pool.',     'DELUXE', 'KING',  2, 5, 480.0, 'POOL',   280.00, 'MAINTENANCE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3);

-- ============================================================
-- Default Room Amenities
-- ============================================================
INSERT INTO room_amenities (room_id, amenity) VALUES
(1, 'AC'), (1, 'TV'), (1, 'Free WiFi'), (1, 'Safe'),
(2, 'AC'), (2, 'TV'), (2, 'Free WiFi'), (2, 'Mini Bar'), (2, 'Safe'),
(3, 'AC'), (3, 'TV'), (3, 'Free WiFi'), (3, 'Mini Bar'), (3, 'Jacuzzi'), (3, 'Balcony'),
(4, 'AC'), (4, 'TV'), (4, 'Free WiFi'), (4, 'Mini Bar'), (4, 'Safe'), (4, 'Sofa Bed'),
(5, 'AC'), (5, 'TV'), (5, 'Free WiFi'), (5, 'Mini Bar'), (5, 'Balcony'),
(6, 'AC'), (6, 'TV'), (6, 'Free WiFi'), (6, 'Mini Bar'), (6, 'Jacuzzi'), (6, 'Pool Access');

-- ============================================================
-- Default Bookings
-- confirmation_number is auto-generated in service; seed uses fixed values
-- total_price = room.price × nights
-- ============================================================
INSERT INTO bookings (confirmation_number, guest_name, guest_email, guest_phone, number_of_guests, check_in_date, check_out_date, total_price, booking_status, payment_status, special_requests, room_id, user_id, created_at, updated_at) VALUES
('BK-SEED0001', 'Ram', 'ram@gmail.com',  '+91-9876543210', 2, '2026-06-01', '2026-06-05', 600.00,  'CONFIRMED', 'PAID',    'Late check-in requested',         1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BK-SEED0002', 'Rajesh',    'rajesh@gmail.com',     '+91-9123456780', 2, '2026-06-10', '2026-06-14', 800.00,  'CONFIRMED', 'PAID',    NULL,                              2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BK-SEED0003', 'John',     'john@gmail.com',      '+91-9345678901', 1, '2026-07-01', '2026-07-04', 750.00,  'CONFIRMED', 'PENDING', 'Vegetarian meals preferred',      3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BK-SEED0004', 'Ramesh',    'ramesh@gmail.com',     '+91-9567890123', 2, '2026-07-10', '2026-07-15', 900.00,  'PENDING',   'PENDING', 'Extra towels and pillows needed', 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
