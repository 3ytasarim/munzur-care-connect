import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PhoneCall, Trash2 } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import {
  adminDeleteInquiry,
  adminListInquiries,
  adminSetInquiryStatus,
} from "@/lib/inquiries.functions";

const STATUSES = [
  { id: "NEW", label: "Yeni" },
  { id: "CONTACTED", label: "Arandı" },
  { id: "QUALIFIED", label: "Uygun" },
  { id: "MATCHED", label: "Eşleşti" },
  { id: "CLOSED", label: "Kapandı" },
  { id: "SPAM", label: "Spam" },
] as const;

export function InquiryPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-inquiries"], queryFn: () => adminListInquiries() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number]["id"] }) =>
      adminSetInquiryStatus({ data: v }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteInquiry({ data: { id } }),
    onSuccess: refresh,
  });

  const items = query.data?.items ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Geri arama talepleri</h2>
          <p className="text-sm text-muted-foreground">
            Site üzerindeki “Bakıcı mı Arıyorsunuz?” formundan gelen kayıtlar.
          </p>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          {items.filter((i) => i.status === "NEW").length} yeni
        </span>
      </div>

      {query.isLoading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Henüz talep yok.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{item.fullName ?? "—"}</p>
                <a
                  href={`tel:${(item.phone ?? "").replace(/\s/g, "")}`}
                  className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                >
                  <PhoneCall className="h-4 w-4" />
                  {item.phone ?? "—"}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString("tr-TR")} · {item.source}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.status}
                  onChange={(e) =>
                    setStatus.mutate({
                      id: item.id,
                      status: e.target.value as (typeof STATUSES)[number]["id"],
                    })
                  }
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <Button3D
                  size="sm"
                  variant="outline"
                  onClick={() => remove.mutate(item.id)}
                  disabled={remove.isPending}
                >
                  <span className="inline-flex items-center gap-1">
                    <Trash2 className="h-4 w-4" /> Sil
                  </span>
                </Button3D>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
