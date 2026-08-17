import { createServerFn } from "@tanstack/react-start";

import { loadFilterOptions, searchCaregivers, type CaregiverSearchInput } from "@/db/queries.server";
import { caregiverSearchSchema } from "@/lib/caregiver-search-schema";

export const getFilterOptions = createServerFn({ method: "GET" }).handler(async () => {
  return loadFilterOptions();
});

export const findCaregivers = createServerFn({ method: "GET" })
  .inputValidator((input: unknown): CaregiverSearchInput => caregiverSearchSchema.parse(input ?? {}))
  .handler(async ({ data }) => searchCaregivers(data));
