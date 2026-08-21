-- MunzurDestek — deneyim yılı ondalıklı olabilsin (ör. 1,5 yıl)
ALTER TABLE "caregiver_profiles"
  ALTER COLUMN "years_of_experience" TYPE numeric(4,1)
  USING "years_of_experience"::numeric(4,1);

ALTER TABLE "caregiver_profiles"
  ALTER COLUMN "years_of_experience" SET DEFAULT 0;
