import { z } from 'zod';

export const bookingCreateSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(1, 'Guest name is required')
    .max(120, 'Guest name must be less than 120 characters'),
  checkInDate: z
    .string()
    .min(1, 'Check-in date is required'),
  checkOutDate: z
    .string()
    .min(1, 'Check-out date is required'),
  roomId: z
    .coerce
    .number({ invalid_type_error: 'Room ID must be a number' })
    .int('Room ID must be an integer')
    .positive('Room ID must be greater than 0'),
});
