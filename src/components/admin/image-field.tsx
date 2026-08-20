import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";

import { Button3D } from "@/components/ui/button-3d";
import { Label } from "@/components/ui/label";

async function fileToResizedDataUrl(file: File, maxW: number, maxH: number) {
  if (file.type === "image/svg+xml") {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read-error"));
      reader.readAsDataURL(file);
    });
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("image-error"));
    el.src = dataUrl;
  });
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  let w = Math.max(1, Math.round(img.width * ratio));
  let h = Math.max(1, Math.round(img.height * ratio));

  // Downscale progressively (halving) for a crisp result instead of one blurry pass.
  let src: HTMLImageElement | HTMLCanvasElement = img;
  let curW = img.width;
  let curH = img.height;
  while (curW / 2 > w) {
    const step = document.createElement("canvas");
    step.width = Math.max(w, Math.round(curW / 2));
    step.height = Math.max(h, Math.round(curH / 2));
    const sctx = step.getContext("2d");
    if (!sctx) break;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(src, 0, 0, step.width, step.height);
    src = step;
    curW = step.width;
    curH = step.height;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

export function ImageField({
  label,
  hint,
  maxWidth,
  maxHeight,
  value,
  onChange,
  dark,
}: {
  label: string;
  hint: string;
  maxWidth: number;
  maxHeight: number;
  value: string;
  onChange: (next: string) => void;
  dark?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > 3 * 1024 * 1024) {
      setError("Dosya 3 MB'tan küçük olmalı.");
      return;
    }
    try {
      onChange(await fileToResizedDataUrl(file, maxWidth, maxHeight));
    } catch {
      setError("Görsel okunamadı.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <Label>{label}</Label>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

      <div className="mt-3 flex items-center gap-3">
        <div
          className={`flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border ${
            dark ? "bg-[#1F2933]" : "bg-white"
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="max-h-14 max-w-24 object-contain" />
          ) : (
            <span className="text-[10px] text-muted-foreground">Görsel yok</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Button3D type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <ImageUp className="mr-1.5 size-4" /> Bilgisayardan Yükle
          </Button3D>
          {value ? (
            <Button3D type="button" variant="outline" onClick={() => onChange("")}>
              <Trash2 className="mr-1.5 size-4" /> Kaldır
            </Button3D>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
