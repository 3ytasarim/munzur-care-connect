import { z } from "zod";

export const caregiverSearchSchema = z.object({
  serviceSlugs: z.array(z.string().max(80)).max(20).optional(),
  workingTypeSlugs: z.array(z.string().max(80)).max(20).optional(),
  skillSlugs: z.array(z.string().max(80)).max(20).optional(),
  city: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  neighborhood: z.string().max(120).optional(),
  minExperience: z.number().int().min(0).max(60).optional(),
  featuredOnly: z.boolean().optional(),
  page: z.number().int().min(1).max(1000).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
});

export type CaregiverSearchParams = z.infer<typeof caregiverSearchSchema>;
