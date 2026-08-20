import { useQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";

import { adminGetAuditLogs } from "@/lib/admin.functions";

const ACTION_LABELS: Record<string, string> = {
  CANDIDATE_APPROVED: "Aday onaylandı",
  CANDIDATE_REJECTED: "Aday reddedildi",
  CANDIDATE_PENDING: "Aday beklemeye alındı",
  CANDIDATE_SUSPENDED: "Aday askıya alındı",
  CANDIDATE_FEATURED: "Öne çıkarma güncellendi",
  CANDIDATE_DELETED: "Aday silindi",
  TAXONOMY_CREATED: "Taksonomi eklendi",
  TAXONOMY_UPDATED: "Taksonomi güncellendi",
  TAXONOMY_DELETED: "Taksonomi silindi",
  TAXONOMY_ENABLED: "Taksonomi aktifleştirildi",
  TAXONOMY_DISABLED: "Taksonomi pasifleştirildi",
  SETTINGS_UPDATED: "Site ayarları güncellendi",
  CONTACT_SETTINGS_UPDATED: "İletişim ayarları güncellendi",
  BANK_SETTINGS_UPDATED: "Banka ayarları güncellendi",
  PASSWORD_CHANGED: "Şifre değiştirildi",
};

export function AuditPanel() {
  const query = useQuery({ queryKey: ["admin-audit"], queryFn: () => adminGetAuditLogs() });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  const items = query.data ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <History className="size-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">İşlem kayıtları</h3>
          <p className="text-sm text-muted-foreground">Son 60 yönetici işlemi.</p>
        </div>
      </div>

      {!items.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Henüz kayıt yok.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {ACTION_LABELS[it.action] ?? it.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {it.entityType}
                  {it.adminName ? ` · ${it.adminName}` : ""}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(it.createdAt).toLocaleString("tr-TR")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
