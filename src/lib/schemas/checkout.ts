import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productVariantId: z.number().int().positive(),
        quantity: z.number().int().min(1)
      })
    )
    .min(1),
  buyerName: z.string().min(1),
  buyerPhone: z.string().min(1),
  receiverName: z.string().min(1),
  receiverPhone: z.string().min(1),
  addressLine: z.string().min(1),
  paymentMethod: z.enum(["COD", "PAYOS"]),
  branchId: z.number().optional(),
  buyerEmail: z.string().optional(),
  customerId: z.number().optional(),
  customerVoucherId: z.number().optional(),
  note: z.string().optional(),
  voucherCode: z.string().optional()
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
