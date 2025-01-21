import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const PASSWORD_SCHEMA = z
  .string()
  .min(8)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .superRefine((value: string, context: any) => {
    if (value === value.toLowerCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing a capital letter",
      });
    }

    if (value === value.toUpperCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing a lowercase letter",
      });
    }

    if (!/\d/.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing a number",
      });
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~\-]/.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing a special character",
      });
    }
  });

export const AuthSchema = z.object({
  email: z.string().email(),
  password: PASSWORD_SCHEMA,
});

export const LogoutSchema = z.object({
  success: z.boolean(),
});

export const ExtendTokenSchema = z.object({
  token: z.string(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email().trim(),
});

export const ResetPasswordSchema = z
  .object({
    resetToken: z.string(),
    password: PASSWORD_SCHEMA,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterSchema = z
  .object({
    name: z.string().min(4, { message: "Name must be at least 4 characters long" }),
    username: z.string().min(4, { message: "Username must be at least 4 characters long" }),
    email: z.string().email(),
    password: PASSWORD_SCHEMA,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type AuthDto = z.infer<typeof AuthSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
