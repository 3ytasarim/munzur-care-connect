import { createServerFn } from "@tanstack/react-start";

import { loadPublicSettings } from "@/db/queries.server";

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  return loadPublicSettings();
});
