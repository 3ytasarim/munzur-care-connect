import { queryOptions, useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/lib/auth.functions";

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => getCurrentUser(),
  staleTime: 60 * 1000,
});

export function useSession() {
  const { data, isPending } = useQuery(sessionQueryOptions);
  return { user: data ?? null, isPending };
}
