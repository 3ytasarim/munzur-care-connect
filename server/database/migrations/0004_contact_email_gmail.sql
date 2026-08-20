-- MunzurDestek — iletişim e-posta adresini güncelle
UPDATE "contact_settings"
SET "email" = 'munzurdestek@gmail.com'
WHERE "email" IS DISTINCT FROM 'munzurdestek@gmail.com';
