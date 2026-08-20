const BASE = "https://api.turkiyeapi.dev/v1";

export type Province = { id: number; name: string };
export type District = { id: number; name: string };
export type Neighborhood = { id: number; name: string };

const collator = new Intl.Collator("tr");

export async function fetchProvinces(): Promise<Province[]> {
  const res = await fetch(`${BASE}/provinces?fields=name,id`);
  if (!res.ok) throw new Error("provinces fetch failed");
  const json = (await res.json()) as { data: Province[] };
  return json.data.sort((a, b) => collator.compare(a.name, b.name));
}

export async function fetchDistricts(provinceId: number): Promise<District[]> {
  const res = await fetch(`${BASE}/provinces/${provinceId}`);
  if (!res.ok) throw new Error("districts fetch failed");
  const json = (await res.json()) as { data: { districts: District[] } };
  return (json.data.districts ?? [])
    .map((d) => ({ id: d.id, name: d.name }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

export async function fetchNeighborhoods(districtId: number): Promise<Neighborhood[]> {
  // District detail is the authoritative endpoint for the selected district and
  // avoids pagination/filter cache inconsistencies on the neighborhoods index.
  const res = await fetch(`${BASE}/districts/${districtId}`);
  if (!res.ok) throw new Error("neighborhoods fetch failed");
  const json = (await res.json()) as {
    data?: { neighborhoods?: Neighborhood[] };
    status?: string;
  };
  const neighborhoods = json.data?.neighborhoods;
  if (!Array.isArray(neighborhoods)) return [];
  const seen = new Set<string>();
  return neighborhoods
    .filter((n) => (seen.has(n.name) ? false : (seen.add(n.name), true)))
    .sort((a, b) => collator.compare(a.name, b.name));
}
