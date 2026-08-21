import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  Clock,
  History,
  LayoutList,
  Settings2,
  Users,
  Newspaper,
  PhoneCall,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { AuditPanel } from "@/components/admin/audit-panel";
import { CandidateEditDialog } from "@/components/admin/candidate-edit-dialog";
import { BlogPanel } from "@/components/admin/blog-panel";
import { InquiryPanel } from "@/components/admin/inquiry-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { TaxonomyPanel } from "@/components/admin/taxonomy-panel";
import { Button3D } from "@/components/ui/button-3d";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, logoutUser } from "@/lib/auth.functions";
import type { AdminCandidate } from "@/db/admin-queries.server";
import {
  adminChangePassword,
  adminDeleteCandidate,
  adminListCandidates,
  adminSetCandidateStatus,
  adminSetFeatured,
  getAdminSession,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli | MunzurDestek" },
      {
        name: "description",
        content: "MunzurDestek yönetim paneli: aday başvurularını inceleyin, onaylayın ve yayınlayın.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Yönetim Paneli | MunzurDestek" },
      { property: "og:description", content: "MunzurDestek aday onay ve yönetim paneli." },
    ],
  }),
  component: AdminPage,
});

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  PENDING: "Bekliyor",
  IN_REVIEW: "İnceleniyor",
  APPROVED: "Onaylı",
  REJECTED: "Reddedildi",
  SUSPENDED: "Askıda",
};

type TabId = "candidates" | "inquiries" | "blog" | "taxonomies" | "settings" | "audit" | "account";

const TABS: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: "candidates", label: "Aday onayı", icon: Users },
  { id: "inquiries", label: "Talepler", icon: PhoneCall },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "taxonomies", label: "Taksonomiler", icon: LayoutList },
  { id: "settings", label: "Site ayarları", icon: Settings2 },
  { id: "audit", label: "İşlem kayıtları", icon: History },
  { id: "account", label: "Hesabım", icon: KeyRound },
];

const FILTERS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

function AdminPage() {
  const session = useQuery({ queryKey: ["admin-session"], queryFn: () => getAdminSession() });

  if (session.isLoading) {
    return (
      <main className="container-page flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </main>
    );
  }

  if (!session.data?.isAdmin) {
    return <AdminLogin notAuthorized={Boolean(session.data && !session.data.isAdmin)} />;
  }

  return <AdminDashboard email={session.data.email} displayName={session.data.displayName} />;
}

/* ------------------------------------------------------------------ login */

function AdminLogin({ notAuthorized }: { notAuthorized: boolean }) {
  const login = useServerFn(loginUser);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login({ data: { email, password } });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      if (res.role !== "ADMIN" && res.role !== "SUPER_ADMIN") {
        setError("Bu hesabın yönetim paneli yetkisi yok.");
        return;
      }
      await queryClient.invalidateQueries();
      await router.invalidate();
    } catch {
      setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Yönetim Paneli</h1>
            <p className="text-sm text-muted-foreground">Yetkili girişi</p>
          </div>
        </div>

        {notAuthorized ? (
          <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Bu hesabın panel yetkisi yok. Yönetici hesabıyla giriş yapın.
          </p>
        ) : null}

        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-email">E-posta</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Şifre</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

        <div className="mt-6">
          <Button3D type="submit" disabled={busy} className="w-full">
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button3D>
        </div>
      </form>
    </main>
  );
}

/* -------------------------------------------------------------- dashboard */

function AdminDashboard({ email, displayName }: { email: string; displayName: string }) {
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("PENDING");
  const [tab, setTab] = useState<TabId>("candidates");
  const [editing, setEditing] = useState<AdminCandidate | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const logout = useServerFn(logoutUser);

  const list = useQuery({
    queryKey: ["admin-candidates", status],
    queryFn: () => adminListCandidates({ data: { status } }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });


  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });

  const setStatusMutation = useMutation({
    mutationFn: (vars: { candidateId: string; status: "APPROVED" | "REJECTED" | "PENDING" | "SUSPENDED" }) =>
      adminSetCandidateStatus({ data: vars }),
    onSuccess: refresh,
  });

  const featuredMutation = useMutation({
    mutationFn: (vars: { candidateId: string; featured: boolean }) => adminSetFeatured({ data: vars }),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { candidateId: string }) => adminDeleteCandidate({ data: vars }),
    onSuccess: refresh,
  });

  async function handleLogout() {
    await logout({});
    queryClient.clear();
    await router.invalidate();
  }

  const stats = list.data?.stats;

  return (
    <main className="container-page space-y-8 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayName} · {email}
          </p>
        </div>
        <Button3D variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" /> Çıkış Yap
        </Button3D>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatBox
          icon={Clock}
          label="Bekleyen başvuru"
          value={stats?.byStatus["PENDING"] ?? 0}
        />
        <StatBox icon={BadgeCheck} label="Onaylı aday" value={stats?.byStatus["APPROVED"] ?? 0} />
        <StatBox icon={ShieldCheck} label="Toplam kayıt" value={stats?.total ?? 0} />
      </section>

      <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === "candidates" ? (
        <>
      <div className="flex flex-wrap gap-2">

        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              status === f
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "ALL" ? "Tümü" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-brand" />
        </div>
      ) : !list.data?.items.length ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Bu durumda kayıt bulunmuyor.
        </p>
      ) : (
        <div className="space-y-4">
          {list.data.items.map((c) => (
            <article
              key={c.id}
              className="flex flex-wrap items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-brand-soft">
                {c.primaryPhotoUrl ? (
                  <img src={c.primaryPhotoUrl} alt={c.fullName} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-lg font-semibold text-brand-strong">
                    {c.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-[240px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{c.fullName}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {c.candidateCode}
                  </span>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong">
                    {STATUS_LABELS[c.approvalStatus] ?? c.approvalStatus}
                  </span>
                  {c.featured ? (
                    <span className="rounded-full bg-highlight/30 px-2 py-0.5 text-xs font-medium text-foreground">
                      Öne çıkan
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[c.city, c.district, c.neighborhood].filter(Boolean).join(" / ") ||
                    "Şehir belirtilmemiş"}{" "}
                  · {c.yearsOfExperience} yıl deneyim
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.email}
                  {c.phone ? ` · ${c.phone}` : ""}
                </p>
                {c.services.length ? (
                  <p className="mt-2 text-sm text-foreground">
                    <span className="text-muted-foreground">Hizmet alanları: </span>
                    {c.services.join(", ")}
                  </p>
                ) : null}
                {c.workingTypes.length ? (
                  <p className="mt-1 text-sm text-foreground">
                    <span className="text-muted-foreground">Çalışma şekli: </span>
                    {c.workingTypes.join(", ")}
                  </p>
                ) : null}
                {c.about ? (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.about}</p>
                ) : null}
                {c.idFrontUrl || c.idBackUrl ? (
                  <div className="mt-3 flex gap-2">
                    {[c.idFrontUrl, c.idBackUrl].filter(Boolean).map((url, i) => (
                      <img
                        key={i}
                        src={url as string}
                        alt={i === 0 ? "Kimlik ön yüz" : "Kimlik arka yüz"}
                        className="h-16 w-24 rounded-lg border border-border object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button3D size="sm" variant="outline" onClick={() => setEditing(c)}>
                  <Pencil className="mr-1.5 size-4" /> Düzenle
                </Button3D>
                {c.approvalStatus !== "APPROVED" ? (
                  <Button3D
                    size="sm"
                    onClick={() =>
                      setStatusMutation.mutate({ candidateId: c.id, status: "APPROVED" })
                    }
                  >
                    <BadgeCheck className="mr-1.5 size-4" /> Onayla
                  </Button3D>
                ) : (
                  <Button3D
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setStatusMutation.mutate({ candidateId: c.id, status: "SUSPENDED" })
                    }
                  >
                    Yayından kaldır
                  </Button3D>
                )}
                <Button3D
                  size="sm"
                  variant="outline"
                  onClick={() => setStatusMutation.mutate({ candidateId: c.id, status: "REJECTED" })}
                >
                  <X className="mr-1.5 size-4" /> Reddet
                </Button3D>
                <Button3D
                  size="sm"
                  variant={c.featured ? "accent" : "ghost"}
                  onClick={() => featuredMutation.mutate({ candidateId: c.id, featured: !c.featured })}
                >
                  <Star className="mr-1.5 size-4" /> Öne çıkar
                </Button3D>
                <Button3D
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`${c.fullName} kaydını silmek istiyor musunuz?`)) {
                      deleteMutation.mutate({ candidateId: c.id });
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button3D>
              </div>
            </article>
          ))}
        </div>
      )}
        </>
      ) : null}

      {editing ? (
        <CandidateEditDialog
          candidate={editing}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        />
      ) : null}

      {tab === "inquiries" ? <InquiryPanel /> : null}
          {tab === "blog" ? <BlogPanel /> : null}
      {tab === "taxonomies" ? <TaxonomyPanel /> : null}
      {tab === "settings" ? <SettingsPanel /> : null}
      {tab === "audit" ? <AuditPanel /> : null}
      {tab === "account" ? <PasswordCard /> : null}
    </main>

  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminChangePassword({ data: { currentPassword, newPassword } });
      setMessage({
        ok: res.ok,
        text: res.ok ? "Şifreniz güncellendi." : (res.message ?? "Şifre güncellenemedi."),
      });
      if (res.ok) {
        setCurrent("");
        setNew("");
      }
    } catch {
      setMessage({ ok: false, text: "Şifre güncellenemedi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Şifre değiştir</h2>
          <p className="text-sm text-muted-foreground">Yönetici hesabınızın şifresini güncelleyin.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cur-pass">Mevcut şifre</Label>
          <Input
            id="cur-pass"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="new-pass">Yeni şifre (en az 8 karakter)</Label>
          <Input
            id="new-pass"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Button3D type="submit" disabled={busy}>
            {busy ? "Güncelleniyor…" : "Şifreyi Güncelle"}
          </Button3D>
          {message ? (
            <span className={`ml-3 text-sm ${message.ok ? "text-brand-strong" : "text-destructive"}`}>
              {message.text}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
