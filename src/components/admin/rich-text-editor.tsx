import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

type Cmd = { icon: typeof Bold; label: string; run: () => void };

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Yazı içeriğini buraya yazın…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  const commands: Cmd[] = [
    { icon: Bold, label: "Kalın", run: () => exec("bold") },
    { icon: Italic, label: "İtalik", run: () => exec("italic") },
    { icon: Underline, label: "Altı çizili", run: () => exec("underline") },
    { icon: Heading2, label: "Başlık 2", run: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, label: "Başlık 3", run: () => exec("formatBlock", "<h3>") },
    { icon: Quote, label: "Alıntı", run: () => exec("formatBlock", "<blockquote>") },
    { icon: List, label: "Madde listesi", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numaralı liste", run: () => exec("insertOrderedList") },
    {
      icon: Link2,
      label: "Bağlantı",
      run: () => {
        const url = window.prompt("Bağlantı adresi (https://…)");
        if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
      },
    },
    { icon: Undo2, label: "Geri al", run: () => exec("undo") },
    { icon: Redo2, label: "İleri al", run: () => exec("redo") },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/50 p-2">
        {commands.map((c) => (
          <button
            key={c.label}
            type="button"
            title={c.label}
            aria-label={c.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={c.run}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand-strong"
          >
            <c.icon className="size-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose-blog min-h-56 max-h-[28rem] overflow-y-auto p-4 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
