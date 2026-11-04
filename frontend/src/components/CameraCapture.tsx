import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { Button } from "./ui";

/** Live camera preview. Captures a still frame and hands it back as a JPEG File. */
export default function CameraCapture({ onCapture, onClose }: { onCapture: (f: File) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shot, setShot] = useState<{ file: File; url: string } | null>(null);

  const start = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (video.current) video.current.srcObject = stream.current;
    } catch (e) {
      const name = (e as DOMException).name;
      setError(name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in the browser and retry."
        : name === "NotFoundError" ? "No camera was found on this device."
        : "The camera could not be started. Upload an image instead.");
    }
  };
  const stop = () => stream.current?.getTracks().forEach((t) => t.stop());

  useEffect(() => { start(); return stop; /* eslint-disable-next-line */ }, []);
  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  const capture = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    c.toBlob((b) => {
      if (!b) return;
      const file = new File([b], "camera-capture.jpg", { type: "image/jpeg" });
      setShot({ file, url: URL.createObjectURL(b) });
    }, "image/jpeg", 0.92);
  };
  const retake = () => { setShot(null); };
  const use = () => { if (shot) { stop(); onCapture(shot.file); } };

  return (
    <div className="space-y-4">
      <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-card border border-line bg-black">
        {error ? (
          <div className="max-w-sm p-6 text-center text-[13px] text-muted">
            <p className="mb-4">{error}</p>
            <Button onClick={start} arrow={false}><RefreshCw size={14} />Try again</Button>
          </div>
        ) : shot ? (
          <img src={shot.url} alt="Captured frame" className="h-full w-full object-contain" />
        ) : (
          <video ref={video} autoPlay playsInline muted className="h-full w-full object-contain" />
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {shot ? (
          <>
            <Button variant="primary" onClick={use}>Use photo</Button>
            <Button onClick={retake} arrow={false}><RefreshCw size={14} />Retake</Button>
          </>
        ) : (
          <Button variant="primary" onClick={capture} disabled={!!error} arrow={false}><Camera size={15} />Capture</Button>
        )}
        <Button onClick={() => { stop(); onClose(); }} arrow={false}><X size={14} />Close camera</Button>
      </div>
    </div>
  );
}
