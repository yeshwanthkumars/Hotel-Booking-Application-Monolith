import { z } from 'zod';

export const roomSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, 'Room number is required')
    .max(50, 'Room number must be less than 50 characters'),
  price: z
    .coerce
    .number({ invalid_type_error: 'Price must be a valid number' })
    .min(0, 'Price cannot be negative'),
  hotelId: z
    .coerce
    .number({ invalid_type_error: 'Hotel ID must be a number' })
    .int('Hotel ID must be an integer')
    .positive('Hotel ID must be greater than 0'),
});
