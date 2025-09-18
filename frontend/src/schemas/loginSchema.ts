import * as z from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine((val) => {
      const emailRegex = /\S+@\S+\.\S+/;
      const phoneRegex = /^\d{7,15}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, "Enter a valid email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
