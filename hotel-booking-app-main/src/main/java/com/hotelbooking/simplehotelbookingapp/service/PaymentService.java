package com.hotelbooking.simplehotelbookingapp.service;
import com.hotelbooking.simplehotelbookingapp.dto.PaymentRequest;
import com.hotelbooking.simplehotelbookingapp.dto.PaymentResponse;
import com.hotelbooking.simplehotelbookingapp.entity.Booking;
import com.hotelbooking.simplehotelbookingapp.entity.BookingStatus;
import com.hotelbooking.simplehotelbookingapp.entity.PaymentStatus;
import com.hotelbooking.simplehotelbookingapp.exception.ResourceNotFoundException;
import com.hotelbooking.simplehotelbookingapp.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private final BookingRepository bookingRepository;
    // ─────────────────────────────────────────────────────────────────────────
    // PROCESS PAYMENT
    // ─────────────────────────────────────────────────────────────────────────
    public PaymentResponse processPayment(PaymentRequest request) {
        Booking booking = findBookingOrThrow(request.getBookingId());
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Booking " + booking.getConfirmationNumber() + " is already paid.");
        }
        if (booking.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new IllegalStateException(
                    "Booking " + booking.getConfirmationNumber() + " has already been refunded.");
        }
        if (request.getAmount().compareTo(booking.getTotalPrice()) != 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.getAmount()
                    + " does not match booking total " + booking.getTotalPrice() + ".");
        }
        // Mock: always succeeds
        String transactionId = "TXN-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        logger.info("Mock payment {} processed for booking {}", transactionId, booking.getConfirmationNumber());
        return new PaymentResponse(
                transactionId,
                booking.getId(),
                booking.getConfirmationNumber(),
                request.getPaymentMethod(),
                request.getAmount(),
                PaymentStatus.PAID,
                BookingStatus.CONFIRMED,
                LocalDateTime.now()
        );
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REFUND PAYMENT
    // ─────────────────────────────────────────────────────────────────────────
    public PaymentResponse refundPayment(Long bookingId) {
        Booking booking = findBookingOrThrow(bookingId);
        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Cannot refund booking " + booking.getConfirmationNumber()
                    + ". Current payment status: " + booking.getPaymentStatus() + ".");
        }
        String transactionId = "TXN-REF-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        logger.info("Mock refund {} processed for booking {}", transactionId, booking.getConfirmationNumber());
        return new PaymentResponse(
                transactionId,
                booking.getId(),
                booking.getConfirmationNumber(),
                null,
                booking.getTotalPrice(),
                PaymentStatus.REFUNDED,
                BookingStatus.CANCELLED,
                LocalDateTime.now()
        );
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }
}