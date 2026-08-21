import { z } from "zod";

export const experienceYears = z.preprocess(
  (v) => {
    if (typeof v === "string") {
      const normalized = v.replace(",", ".").trim();
      if (normalized === "") return 0;
      return Number(normalized);
    }
    return v ?? 0;
  },
  z
    .number({ invalid_type_error: "Deneyim yılını sayı olarak girin." })
    .min(0, "Deneyim yılı 0'dan küçük olamaz.")
    .max(60, "Deneyim yılı en fazla 60 olabilir.")
    .transform((n) => Math.round(n * 10) / 10),
);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifrenizi girin."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Adınızı girin.").max(80),
    lastName: z.string().trim().min(2, "Soyadınızı girin.").max(80),
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
    phone: z
      .string()
      .trim()
      .min(10, "Telefon numaranızı girin.")
      .max(32)
      .regex(/^[0-9 +()-]+$/, "Telefon numarası yalnızca rakam içermelidir."),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır.").max(128),
    passwordConfirm: z.string(),
    city: z.string().trim().min(2, "İl seçin.").max(80),
    district: z.string().trim().min(2, "İlçe seçin.").max(80),
    neighborhood: z.string().trim().min(2, "Mahalle seçin.").max(120),
    yearsOfExperience: experienceYears,
    about: z.string().trim().max(2000).optional().default(""),
    photoDataUrl: z
      .string({ required_error: "Profil fotoğrafı zorunludur." })
      .max(2_500_000, "Fotoğraf çok büyük.")
      .regex(/^data:image\/(jpeg|png|webp);base64,/, "Geçersiz fotoğraf."),
    idFrontDataUrl: z
      .string({ required_error: "Kimlik ön yüz fotoğrafı zorunludur." })
      .max(2_500_000, "Kimlik ön yüz fotoğrafı çok büyük.")
      .regex(/^data:image\/(jpeg|png|webp);base64,/, "Geçersiz kimlik ön yüz fotoğrafı."),
    idBackDataUrl: z
      .string({ required_error: "Kimlik arka yüz fotoğrafı zorunludur." })
      .max(2_500_000, "Kimlik arka yüz fotoğrafı çok büyük.")
      .regex(/^data:image\/(jpeg|png|webp);base64,/, "Geçersiz kimlik arka yüz fotoğrafı."),
    serviceIds: z.array(z.string().uuid()).min(1, "En az bir hizmet alanı seçin."),
    workingTypeIds: z.array(z.string().uuid()).default([]),
    kvkkAccepted: z.literal(true, {
      errorMap: () => ({ message: "Devam etmek için KVKK metnini onaylayın." }),
    }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Şifreler eşleşmiyor.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
