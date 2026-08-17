-- Stable, name-independent candidate codes: MD-1001, MD-1002, ...
CREATE SEQUENCE IF NOT EXISTS candidate_code_seq START WITH 1001 INCREMENT BY 1;
--> statement-breakpoint
ALTER TABLE "caregiver_profiles"
  ALTER COLUMN "candidate_code" SET DEFAULT 'MD-' || nextval('candidate_code_seq');
--> statement-breakpoint

-- Reference data (taxonomies) -------------------------------------------------
INSERT INTO "service_categories" ("slug","name","sort_order") VALUES
  ('yasli-bakimi','Yaşlı Bakımı',1),
  ('bebek-bakimi','Bebek Bakımı',2),
  ('cocuk-bakimi','Çocuk Bakımı',3),
  ('hasta-bakimi','Hasta Bakımı',4),
  ('engelli-bakimi','Engelli Bakımı',5),
  ('ev-isleri','Ev İşleri / Temizlik',6),
  ('yemek','Yemek / Aşçılık',7),
  ('refakatci','Hastane Refakatçisi',8)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "working_types" ("slug","name","sort_order") VALUES
  ('yatili','Yatılı',1),
  ('gunduzlu','Gündüzlü',2),
  ('yarim-gun','Yarım Gün',3),
  ('saatlik','Saatlik',4),
  ('hafta-sonu','Hafta Sonu',5),
  ('gecici','Geçici / Dönemsel',6)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "skills" ("slug","name","sort_order") VALUES
  ('alzheimer','Alzheimer Bakımı',1),
  ('demans','Demans Bakımı',2),
  ('felc','Felçli Hasta Bakımı',3),
  ('yatak-yarasi','Yatak Yarası Bakımı',4),
  ('ilac-takibi','İlaç Takibi',5),
  ('tansiyon-seker','Tansiyon / Şeker Ölçümü',6),
  ('fizik-tedavi','Fizik Tedavi Desteği',7),
  ('ilk-yardim','İlk Yardım',8),
  ('emzikli-bebek','0-1 Yaş Bebek Bakımı',9),
  ('ozel-diyet','Özel Diyet Yemekleri',10)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "languages" ("code","name","sort_order") VALUES
  ('tr','Türkçe',1),
  ('en','İngilizce',2),
  ('ar','Arapça',3),
  ('ru','Rusça',4),
  ('de','Almanca',5),
  ('ku','Kürtçe',6)
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint

-- Site settings ---------------------------------------------------------------
INSERT INTO "site_settings" ("key","value","group") VALUES
  ('site_name','MunzurDestek','branding'),
  ('logo_url','','branding'),
  ('dark_logo_url','','branding'),
  ('mobile_logo_url','','branding'),
  ('favicon_url','/favicon.ico','branding'),
  ('primary_color','#57B614','branding'),
  ('secondary_color','#FFDE58','branding'),
  ('company_name','MunzurDestek','general'),
  ('default_currency','TRY','general'),
  ('candidate_payment_required','false','features')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "contact_settings" ("phone","whatsapp","email","address")
SELECT '', '', '', '' WHERE NOT EXISTS (SELECT 1 FROM "contact_settings");
--> statement-breakpoint
INSERT INTO "bank_settings" ("bank_name","account_holder","iban","payment_amount","currency","payment_description_template","active")
SELECT '', '', '', 0, 'TRY', 'MunzurDestek aday kayıt ücreti - {candidate_code}', true
WHERE NOT EXISTS (SELECT 1 FROM "bank_settings");
