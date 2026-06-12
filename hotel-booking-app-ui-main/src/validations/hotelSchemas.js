import { z } from 'zod';

export const hotelSchema = z.object({
  name: z
    .string()
    .min(1, 'Hotel name is required')
    .max(100, 'Hotel name must be less than 100 characters'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(255, 'Location must be less than 255 characters'),
});
