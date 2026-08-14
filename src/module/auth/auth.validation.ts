import * as z from "zod";

export const loginSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
  }),
});

export const registerSchema = z.strictObject({
  body: z
    .strictObject({
      email: z
        .string()
        .email()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          message: "Invalid email format",
        })
        .transform((val) => val.toLowerCase()),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message:
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          },
        ),
      confirmPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message:
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          },
        ),
      name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters long" }),
      gender: z.enum(["male", "female"], {
        message: "Gender must be either 'male' or 'female'",
      }),
      role: z.enum(["admin", "user"], {
        message: "Role must be either 'admin' or 'user'",
      }),
      provider: z.enum(["google", "facebook", "system"], {
        message: "Provider must be either 'google', 'facebook', or 'system'",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const verifyOtpSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
    otp: z
      .string()
      .min(6, { message: "OTP must be at least 6 characters long" }),
  }),
});

export const resendOtpSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
  }),
});

export const forgetPasswordSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
  }),
});

export const resetPasswordSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
    otp: z
      .string()
      .min(6, { message: "OTP must be at least 6 characters long" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
  }),
});

export const changePasswordSchema = z.strictObject({
  body: z.strictObject({
    email: z
      .string()
      .email()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" })
      .transform((val) => val.toLowerCase()),
    oldPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
  }),
});

export const refreshTokenSchema = z.strictObject({
  body: z.strictObject({
    refreshToken: z
      .string({
        message: "Refresh token is required",
      })
      .min(1, { message: "Refresh token must be at least 1 character long" }),
  }),
});

export const logoutSchema = z.strictObject({
  body: z.strictObject({
    refreshToken: z
      .string({
        message: "Refresh token is required",
      })
      .min(1, { message: "Refresh token must be at least 1 character long" }),
    accessToken: z
      .string({
        message: "Access token is required",
      })
      .min(1, { message: "Access token must be at least 1 character long" }),
  }),
});
