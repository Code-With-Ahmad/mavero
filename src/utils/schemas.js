import { z } from "zod";
import { luhnCheck, isValidExpiry } from "./cardValidation";

function passwordSchema(t) {
  return z
    .string()
    .min(8, t("validation.passwordMin"))
    .regex(/[a-z]/, t("validation.passwordLower"))
    .regex(/[A-Z]/, t("validation.passwordUpper"))
    .regex(/[0-9]/, t("validation.passwordNumber"));
}

export function getSignupSchema(t) {
  return z
    .object({
      name: z.string().trim().min(2, t("validation.nameRequired")),
      email: z.string().trim().email(t("validation.emailInvalid")),
      password: passwordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsNoMatch"),
      path: ["confirmPassword"],
    });
}

export function getLoginSchema(t) {
  return z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });
}

export function getForgotPasswordSchema(t) {
  return z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
  });
}

export function getContactSchema(t) {
  return z.object({
    name: z.string().trim().min(2, t("validation.nameRequired")),
    email: z.string().trim().email(t("validation.emailInvalid")),
    subject: z.string().trim().min(3, t("validation.subjectMin")),
    message: z.string().trim().min(10, t("validation.messageMin")),
  });
}

export function getNewsletterSchema(t) {
  return z.object({
    email: z.string().trim().email(t("validation.emailInvalid")),
  });
}

export function getProfileSchema(t) {
  return z.object({
    name: z.string().trim().min(2, t("validation.nameRequired")),
    phone: z
      .string()
      .trim()
      .regex(/^$|^[+\d][\d\s-]{6,}$/, t("validation.phoneInvalid"))
      .optional(),
  });
}

export function getChangePasswordSchema(t) {
  return z
    .object({
      currentPassword: z.string().min(1, t("validation.currentPasswordRequired")),
      newPassword: passwordSchema(t),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("validation.passwordsNoMatch"),
      path: ["confirmNewPassword"],
    });
}

export function getCardPaymentSchema(t) {
  return z.object({
    cardholderName: z.string().trim().min(2, t("validation.cardholderNameRequired")),
    cardNumber: z
      .string()
      .trim()
      .refine((val) => luhnCheck(val), t("validation.cardNumberInvalid")),
    expiry: z
      .string()
      .trim()
      .refine((val) => isValidExpiry(val), t("validation.expiryInvalid")),
    cvv: z
      .string()
      .trim()
      .regex(/^\d{3,4}$/, t("validation.cvvInvalid")),
  });
}

export function getAddressSchema(t) {
  return z.object({
    fullName: z.string().trim().min(2, t("validation.recipientNameRequired")),
    phone: z.string().trim().min(6, t("validation.phoneInvalid")),
    addressLine1: z.string().trim().min(3, t("validation.addressLine1Required")),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(2, t("validation.cityRequired")),
    state: z.string().trim().min(2, t("validation.stateRequired")),
    postalCode: z.string().trim().min(2, t("validation.postalCodeRequired")),
    country: z.string().trim().min(2, t("validation.countryRequired")),
    note: z.string().trim().optional(),
  });
}

export function getSavedAddressSchema(t) {
  return getAddressSchema(t).omit({ note: true });
}
