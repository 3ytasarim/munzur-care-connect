-- MunzurDestek — kimlik ön/arka yüz fotoğrafları
ALTER TABLE "caregiver_profiles" ADD COLUMN IF NOT EXISTS "id_front_url" text;
ALTER TABLE "caregiver_profiles" ADD COLUMN IF NOT EXISTS "id_back_url" text;
