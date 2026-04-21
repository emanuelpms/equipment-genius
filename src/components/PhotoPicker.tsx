import { useRef, useState } from "react";
import { Upload, Link2, X, Image as ImageIcon } from "lucide-react";

export function PhotoPicker({
  value, onChange, aspect = "video",
}: { value?: string; onChange: (v: string | undefined) => void; aspect?: "video" | "square" }) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState(value && value.startsWith("http") ? value : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 3MB. Para imagens maiores use uma URL.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className={`relative rounded-xl border-2 border-dashed border-border bg-input/20 ${aspect === "square" ? "aspect-square" : "aspect-video"} mb-3 overflow-hidden grid place-items-center`}>
        {value ? (
          <>
            <img src={value} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
            <button onClick={() => onChange(undefined)} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur grid place-items-center hover:bg-destructive hover:text-destructive-foreground transition">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center text-muted-foreground text-xs">
            <ImageIcon className="h-8 w-8 mx-auto mb-1.5 opacity-50" />
            Sem imagem
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-input/40 rounded-lg p-1 mb-2">
        {(["upload", "url"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} type="button"
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition inline-flex items-center justify-center gap-1.5 ${mode === m ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"}`}>
            {m === "upload" ? <><Upload className="h-3 w-3" />Upload</> : <><Link2 className="h-3 w-3" />URL</>}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full px-3 py-2 rounded-lg bg-accent/60 hover:bg-accent text-sm font-medium inline-flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" /> Escolher arquivo
          </button>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Máx 3MB. Salvo localmente.</p>
        </>
      ) : (
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
            className="flex-1 bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button type="button" onClick={() => url.trim() && onChange(url.trim())}
            className="px-3 py-2 rounded-lg bg-primary text-background text-sm font-semibold">Aplicar</button>
        </div>
      )}
    </div>
  );
}