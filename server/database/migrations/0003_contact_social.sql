-- MunzurDestek — extra social channels + default contact info
ALTER TABLE "contact_settings" ADD COLUMN IF NOT EXISTS "youtube_url" text;
ALTER TABLE "contact_settings" ADD COLUMN IF NOT EXISTS "twitter_url" text;
ALTER TABLE "contact_settings" ADD COLUMN IF NOT EXISTS "tiktok_url" text;
ALTER TABLE "contact_settings" ADD COLUMN IF NOT EXISTS "map_embed_query" text;

INSERT INTO "contact_settings" ("phone", "whatsapp", "email", "address", "active")
SELECT '+90 532 721 72 62', '+90 532 721 72 62', 'info@munzurdestek.com',
       'Postane Mahallesi Cumhuriyet Caddesi Tuzla Port, Tuzla - İSTANBUL', true
WHERE NOT EXISTS (SELECT 1 FROM "contact_settings" WHERE "active" = true);

UPDATE "contact_settings"
SET "phone" = COALESCE(NULLIF("phone", ''), '+90 532 721 72 62'),
    "whatsapp" = COALESCE(NULLIF("whatsapp", ''), '+90 532 721 72 62'),
    "email" = COALESCE(NULLIF("email", ''), 'info@munzurdestek.com'),
    "address" = COALESCE(NULLIF("address", ''), 'Postane Mahallesi Cumhuriyet Caddesi Tuzla Port, Tuzla - İSTANBUL')
WHERE "active" = true;
