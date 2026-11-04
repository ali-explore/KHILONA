import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Box, Camera, Info, Loader2, RefreshCw, ScanLine, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import CameraCapture from "../components/CameraCapture";
import { Button, Card, CardHeader, PageHeader, Pill } from "../components/ui";
import { ApiError, Prediction, predictImage } from "../lib/api";
import { CLASS_META, CLASS_ORDER, isClassName } from "../lib/classes";
import { useApp } from "../lib/AppContext";

type Status = "idle" | "loading" | "success" | "error";
const MAX_MB = 10;

export default function Detection() {
  const { modelLoaded, recordResult, refreshHealth, lastResult } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<{ title: string; text: string } | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [camera, setCamera] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const resetPrediction = useCallback(() => { setResult(null); setError(null); setStatus("idle"); recordResult(null); }, [recordResult]);

  const accept = (f: File | undefined) => {
    if (!f) return;
    setUploadMsg(null);
    if (!["image/jpeg", "image/png"].includes(f.type)) { setUploadMsg("Unsupported file. Use a JPG, JPEG or PNG image."); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setUploadMsg(`Image is larger than ${MAX_MB} MB.`); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setCamera(false); resetPrediction();
  };
  const remove = () => { setFile(null); setPreview(null); setUploadMsg(null); resetPrediction(); if (input.current) input.current.value = ""; };

  const analyze = async () => {
    if (!file) return;
    setStatus("loading"); setError(null); setResult(null);
    try {
      const r = await predictImage(file);
      setResult(r); setStatus("success"); recordResult(r);
    } catch (e) {
      const err = e as ApiError;
      setStatus("error"); refreshHealth();
      setError(err.kind === "offline"
        ? { title: "Backend offline", text: "The analysis service can't be reached. Start the backend (see README), then analyze again." }
        : err.kind === "model"
        ? { title: "Model not connected", text: `${err.message} Add the trained model files to the model folder and restart the backend.` }
        : { title: "Analysis failed", text: err.message || "Something went wrong. Try a different image." });
    }
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files?.[0]); };
  const predicted = result && isClassName(result.predicted_class) ? CLASS_META[result.predicted_class] : null;
  const activeClass = predicted?.name ?? (lastResult && isClassName(lastResult.predicted_class) && status === "success" ? lastResult.predicted_class : null);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Detection workspace" title="Object Identification"
        subtitle="Upload or capture a plastic object to identify its color and determine the correct conveyor destination." />
      <input ref={input} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Choose image file" onChange={(e) => accept(e.target.files?.[0])} />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        {/* 01 · Object input */}
        <Card className="p-6">
          <CardHeader index="01" title="Object input" right={<Pill>{file ? "Image selected" : "No image selected"}</Pill>} />
          <div className="mt-5">
            {camera ? (
              <CameraCapture onCapture={accept} onClose={() => setCamera(false)} />
            ) : (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
                  className={`relative grid aspect-[16/9] place-items-center overflow-hidden rounded-card border border-dashed grid-surface transition-colors ${drag ? "border-brand bg-brand/10" : "border-line bg-app/60"}`}>
                  {preview ? (
                    <img src={preview} alt="Selected object" className="h-full w-full object-contain p-3" />
                  ) : (
                    <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center px-6 text-center">
                      <span className="mb-5 grid h-14 w-14 place-items-center rounded-xl border border-line bg-raised text-brand"><Upload size={20} /></span>
                      <span className="text-[17px] font-semibold">Drop an object image here</span>
                      <span className="mt-1.5 text-[12px] text-muted">A clear image. A precise destination.</span>
                      <span className="mt-8 text-[10px] text-faint">JPG, JPEG or PNG</span>
                    </button>
                  )}
                  {status === "loading" && <div className="absolute inset-0 grid place-items-center bg-app/60"><Loader2 className="animate-spin text-brand" /></div>}
                </div>
                {uploadMsg && <p role="alert" className="mt-3 flex items-center gap-2 text-[12px] text-red-400"><AlertTriangle size={14} />{uploadMsg}</p>}
                <div className="mt-4 flex flex-wrap gap-3">
                  {file ? (
                    <>
                      <Button variant="primary" onClick={analyze} disabled={status === "loading"}><ScanLine size={15} />Analyze object</Button>
                      <Button onClick={() => input.current?.click()} disabled={status === "loading"}>Replace image</Button>
                      <Button onClick={remove} disabled={status === "loading"} arrow={false}><Trash2 size={14} />Remove</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="primary" onClick={() => input.current?.click()}>Upload image</Button>
                      <Button onClick={() => setCamera(true)}>Use camera</Button>
                    </>
                  )}
                  {file && <Button onClick={() => setCamera(true)} arrow={false} disabled={status === "loading"}><Camera size={14} />Camera</Button>}
                </div>
                <p className="mt-4 flex items-center justify-between text-[11px] text-faint">
                  <span>{file ? `${file.name} · Selected image preview` : "Images are processed only when you start analysis."}</span><Info size={13} />
                </p>
              </>
            )}
          </div>
        </Card>

        {/* 02 · AI analysis */}
        <Card className="flex flex-col p-6">
          <CardHeader index="02" title="AI analysis" right={<Pill tone="blue">Custom CNN</Pill>} />
          <div className="flex flex-1 flex-col justify-center py-6" aria-live="polite">
            {status === "idle" && (
              <div className="text-center">
                <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-xl border border-line bg-raised text-brand"><ScanLine size={26} /></span>
                <p className="text-[17px] font-semibold">{file ? "Ready to analyze." : "Waiting for object input."}</p>
                <p className="mx-auto mt-2 max-w-[260px] text-[12px] text-muted">{file ? "Select Analyze object to run the model." : "Upload an image or use your camera. Your model results will appear here."}</p>
              </div>
            )}
            {status === "loading" && (
              <div className="text-center"><Loader2 className="mx-auto mb-4 animate-spin text-brand" size={34} /><p className="text-[17px] font-semibold">Analyzing object…</p><p className="mt-2 text-[12px] text-muted">Running CNN classification.</p></div>
            )}
            {status === "error" && error && (
              <div className="text-center">
                <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-red-400/30 bg-red-400/10 text-red-400"><AlertTriangle size={24} /></span>
                <p className="text-[17px] font-semibold">{error.title}</p>
                <p className="mx-auto mt-2 max-w-[300px] text-[12px] text-muted">{error.text}</p>
                <Button className="mx-auto mt-5" onClick={analyze} arrow={false}><RefreshCw size={14} />Try again</Button>
              </div>
            )}
            {status === "success" && result && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-faint">Detected color</p>
                <p className="mt-1 text-[44px] font-bold uppercase leading-none" style={{ color: predicted?.color }}>{result.predicted_class}</p>
                <p className="mt-3 flex items-center gap-2 text-[12px] text-ok"><i className="h-1.5 w-1.5 rounded-full bg-ok" />Classification complete</p>
                <div className="my-4 h-px bg-line" />
                <div className="flex items-end justify-between"><span className="text-[13px] text-muted">Confidence</span><span className="text-2xl font-semibold">{(result.confidence * 100).toFixed(1)} %</span></div>
                <div className="mt-4 space-y-2.5">
                  {CLASS_ORDER.map((c) => {
                    const p = result.probabilities[c] ?? 0;
                    return (
                      <div key={c} className="grid grid-cols-[52px_1fr_52px] items-center gap-3 text-[11px]">
                        <span style={{ color: CLASS_META[c].color }}>{c}</span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-app"><span className="block h-full rounded-full transition-all duration-500" style={{ width: `${p * 100}%`, background: CLASS_META[c].color }} /></span>
                        <span className="text-right text-muted">{(p * 100).toFixed(1)} %</span>
                      </div>);
                  })}
                </div>
                <div className="mt-5 rounded-lg border border-brand/30 bg-brand/10 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-brand">Predicted destination</p>
                  <p className="mt-1 text-[17px] font-bold uppercase">{result.conveyor}</p>
                </div>
                <div className="mt-4 flex items-center gap-4"><Button onClick={resetPrediction}>Reset prediction</Button><Link to="/conveyor" className="text-[12px] text-brand hover:underline">View on conveyor</Link></div>
              </div>
            )}
          </div>
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[9px] uppercase tracking-wider text-faint">Classification model</p><p className="mt-1.5 text-[14px] font-semibold">Custom-trained CNN</p></div>
              <Pill tone={modelLoaded ? "green" : "yellow"}>{modelLoaded ? "Connected" : "Not connected"}</Pill>
            </div>
            {!modelLoaded && <p className="mt-3 text-[11px] text-faint">Live predictions require a connected model.</p>}
          </div>
        </Card>
      </div>

      <h2 className="mb-1 mt-8 text-[17px] font-semibold">Routing destinations</h2>
      <p className="mb-4 text-[12px] text-muted">Color determines the route. Hardware is not connected.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {CLASS_ORDER.map((c) => {
          const m = CLASS_META[c]; const on = activeClass === c;
          return (
            <div key={c} className={`flex items-center justify-between rounded-card border bg-panel py-4 pl-5 pr-4 transition-colors ${on ? "border-brand/70 bg-raised" : "border-line"}`} style={{ borderLeft: `3px solid ${m.color}` }}>
              <div className="flex items-center gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-raised" style={{ color: m.color }}><Box size={17} /></span>
                <div><p className="text-[9px] uppercase tracking-wider" style={{ color: m.color }}>{c} objects</p><p className="mt-1 text-[14px] font-semibold">{m.conveyor}</p></div>
              </div>
              <ArrowRight size={15} className="text-muted" />
            </div>);
        })}
      </div>
    </div>
  );
}
