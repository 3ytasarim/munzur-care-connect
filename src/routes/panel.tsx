import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import { getCurrentUser, logoutUser } from "@/lib/auth.functions";

const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: () => getCurrentUser(),
});

const APPROVAL_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  PENDING: "İnceleme bekliyor",
  IN_REVIEW: "İnceleniyor",
  APPROVED: "Onaylandı — yayında",
  REJECTED: "Reddedildi",
  SUSPENDED: "Askıya alındı",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Süper Yönetici",
  ADMIN: "Yönetici",
  CONSULTANT: "Danışman",
  CAREGIVER: "Aday",
};

export const Route = createFileRoute("/panel")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionQuery),
  head: () => ({
    meta: [
      { title: "Panelim | MunzurDestek" },
      {
        name: "description",
        content: "MunzurDestek hesap paneliniz: başvuru durumunuz, aday kodunuz ve hesap bilgileriniz.",
      },
      { property: "og:title", content: "Panelim | MunzurDestek" },
      { property: "og:description", content: "MunzurDestek hesap paneliniz." },
    ],
  }),
  component: PanelPage,
});

function PanelPage() {
  const { data: user } = useSuspenseQuery(sessionQuery);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useServerFn(logoutUser);

  async function handleLogout() {
    await queryClient.cancelQueries();
    await logout({});
    queryClient.clear();
    await router.invalidate();
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="container-page py-12">
        {!user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-foreground">Giriş yapmanız gerekiyor</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Panelinizi görüntülemek için hesabınıza giriş yapın.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/giris">Giriş Yap</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/kayit">Aday Kaydı</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Merhaba, {user.displayName}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ROLE_LABELS[user.role] ?? user.role} · {user.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {user.candidateCode ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BadgeCheck className="size-4 text-brand" /> Aday Kodunuz
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {user.candidateCode}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bizimle iletişime geçerken bu kodu paylaşın.
                  </p>
                </div>
              ) : null}

              {user.approvalStatus ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="size-4 text-brand" /> Başvuru Durumu
                  </div>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {APPROVAL_LABELS[user.approvalStatus] ?? user.approvalStatus}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Onaylanan profiller arama sonuçlarında yayınlanır.
                  </p>
                </div>
              ) : null}

              {user.role !== "CAREGIVER" ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ShieldCheck className="size-4 text-brand" /> Yönetim
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Yönetim modülleri (aday onayı, taksonomiler, site ayarları) bir sonraki adımda
                    bu panele eklenecek.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
    </main>
  );
}
