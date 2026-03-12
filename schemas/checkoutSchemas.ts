import { z } from "zod";

export const shippingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  address: z.string().min(5, "Address requires at least 5 characters").max(200),
  city: z.string().min(2, "City is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
});

export const paymentSchema = z.object({
  method: z.enum(["gold", "upi", "credit_card", "paypal", "apple_pay"], {
    errorMap: () => ({ message: "Please select a valid payment method" }),
  }),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
