import { Camera, ImagePlus, RefreshCw, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button3D } from "@/components/ui/button-3d";

const MAX_EDGE = 720;
const QUALITY = 0.82;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  return drawToDataUrl(bitmap, bitmap.width, bitmap.height);
}

function drawToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

type Props = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Kamera dışındaki (galeri) seçeneği gizler. */
  cameraOnly?: boolean;
};

/** Profile photo picker: gallery upload or live camera capture (mobile + desktop). */
export function PhotoCapture({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } catch {
      setError("Fotoğraf işlenemedi. Farklı bir görsel deneyin.");
    }
  }

  async function startCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      // Permission denied or no webcam: fall back to the OS camera app on mobile.
      cameraInputRef.current?.click();
    }
  }

  function shoot() {
    const video = videoRef.current;
    if (!video) return;
    try {
      onChange(drawToDataUrl(video, video.videoWidth, video.videoHeight));
      stopCamera();
    } catch {
      setError("Fotoğraf alınamadı, tekrar deneyin.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
          {value ? (
            <img src={value} alt="Seçilen profil fotoğrafı" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-7" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button3D
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="size-4" aria-hidden />
            Galeriden seç
          </Button3D>
          <Button3D type="button" variant="outline" size="sm" onClick={startCamera}>
            <Camera className="size-4" aria-hidden />
            {cameraOn ? "Kamera açık" : "Kamerayla çek"}
          </Button3D>
          {value ? (
            <Button3D type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 className="size-4" aria-hidden />
              Kaldır
            </Button3D>
          ) : null}
        </div>
      </div>

      {cameraOn ? (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-foreground/95">
          <video ref={videoRef} playsInline muted className="aspect-video w-full object-cover" />
          <div className="flex items-center justify-center gap-2 p-3">
            <Button3D type="button" size="sm" onClick={shoot}>
              <Camera className="size-4" aria-hidden />
              Çek
            </Button3D>
            <Button3D type="button" size="sm" variant="outline" onClick={startCamera}>
              <RefreshCw className="size-4" aria-hidden />
              Yenile
            </Button3D>
            <Button3D type="button" size="sm" variant="ghost" onClick={stopCamera}>
              <X className="size-4" aria-hidden />
              Kapat
            </Button3D>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
