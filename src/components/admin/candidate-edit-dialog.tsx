import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button3D } from "@/components/ui/button-3d";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCandidate } from "@/db/admin-queries.server";
import { adminUpdateCandidate } from "@/lib/admin.functions";
import { getFilterOptions } from "@/lib/caregivers.functions";

export function CandidateEditDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: AdminCandidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const options = useQuery({
    queryKey: ["filter-options"],
    queryFn: () => getFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    phone: candidate.phone ?? "",
    city: candidate.city ?? "",
    district: candidate.district ?? "",
    neighborhood: candidate.neighborhood ?? "",
    about: candidate.about ?? "",
    yearsOfExperience: String(candidate.yearsOfExperience).replace(".", ","),
  });
  const [serviceIds, setServiceIds] = useState<string[]>(candidate.serviceIds);
  const [workingTypeIds, setWorkingTypeIds] = useState<string[]>(candidate.workingTypeIds);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phone: candidate.phone ?? "",
      city: candidate.city ?? "",
      district: candidate.district ?? "",
      neighborhood: candidate.neighborhood ?? "",
      about: candidate.about ?? "",
      yearsOfExperience: String(candidate.yearsOfExperience).replace(".", ","),
    });
    setServiceIds(candidate.serviceIds);
    setWorkingTypeIds(candidate.workingTypeIds);
    setError(null);
  }, [open, candidate]);

  const save = useMutation({
    mutationFn: () =>
      adminUpdateCandidate({
        data: {
          candidateId: candidate.id,
          ...form,
          yearsOfExperience: Number(String(form.yearsOfExperience || "0").replace(",", ".")),
          serviceIds,
          workingTypeIds,
        },
      }),
    onSuccess: async (res) => {
      if (!res.ok) {
        setError(res.message ?? "Kaydedilemedi.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
      onOpenChange(false);
    },
    onError: () => setError("Kaydedilemedi. Lütfen tekrar deneyin."),
  });

  const chip = (active: boolean) =>
    active
      ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-strong"
      : "rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-brand hover:text-foreground";

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aday bilgilerini düzenle</DialogTitle>
          <DialogDescription>
            {candidate.candidateCode} · Onaylamadan önce hatalı girilen bilgileri düzeltebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-first">Ad</Label>
            <Input
              id="edit-first"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-last">Soyad</Label>
            <Input
              id="edit-last"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">Telefon</Label>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-exp">Deneyim (yıl)</Label>
            <Input
              id="edit-exp"
              type="text"
              inputMode="decimal"
              placeholder="Örn. 1,5"
              value={form.yearsOfExperience}
              onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-city">İl</Label>
            <Input
              id="edit-city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="edit-district">İlçe</Label>
            <Input
              id="edit-district"
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-neighborhood">Mahalle</Label>
            <Input
              id="edit-neighborhood"
              value={form.neighborhood}
              onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-about">Kısaca bahsetme</Label>
            <Textarea
              id="edit-about"
              rows={4}
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">Hizmet alanları</legend>
          <div className="flex flex-wrap gap-2">
            {(options.data?.services ?? []).map((s) => (
              <button
                key={s.id}
                type="button"
                className={chip(serviceIds.includes(s.id))}
                onClick={() => toggle(serviceIds, setServiceIds, s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">Çalışma şekli</legend>
          <div className="flex flex-wrap gap-2">
            {(options.data?.workingTypes ?? []).map((w) => (
              <button
                key={w.id}
                type="button"
                className={chip(workingTypeIds.includes(w.id))}
                onClick={() => toggle(workingTypeIds, setWorkingTypeIds, w.id)}
              >
                {w.name}
              </button>
            ))}
          </div>
        </fieldset>

        {candidate.idFrontUrl || candidate.idBackUrl ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Kimlik fotoğrafları</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Ön yüz", url: candidate.idFrontUrl },
                { label: "Arka yüz", url: candidate.idBackUrl },
              ].map((doc) =>
                doc.url ? (
                  <figure key={doc.label} className="overflow-hidden rounded-xl border border-border">
                    <img src={doc.url} alt={`Kimlik ${doc.label}`} className="w-full object-cover" />
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                      {doc.label}
                    </figcaption>
                  </figure>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button3D type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button3D>
          <Button3D type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Kaydediliyor…" : "Kaydet"}
          </Button3D>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
