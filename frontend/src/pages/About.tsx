import { ArrowRight } from "lucide-react";
import { Card, PageHeader } from "../components/ui";
import { CLASS_META, CLASS_ORDER } from "../lib/classes";

const STAGES = [
  ["Image collection", "Collect plastic object images across three color categories."],
  ["Preprocessing", "Prepare and normalize images for the classification model."],
  ["CNN training", "Train a custom network to learn color-based features."],
  ["Classification", "Predict the object's color using the trained CNN."],
  ["Route prediction", "Assign the corresponding conveyor destination."],
];
const STACK = ["Python", "TensorFlow / Keras", "Custom CNN", "React", "FastAPI"];

export default function About() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader eyebrow="Project overview" title="About KHILONA" subtitle="Intelligent sorting, built for the next generation of toy manufacturing." />
      <Card className="mb-8 grid gap-8 p-6 md:grid-cols-2 md:p-8">
        <div><p className="eyebrow mb-4">Vision-driven manufacturing</p><p className="text-3xl font-bold leading-tight">Small objects.<br />Smarter decisions.</p></div>
        <div>
          <p className="text-[15px] leading-relaxed">KHILONA is an AI-powered plastic object classification and conveyor routing solution developed for intelligent toy manufacturing.</p>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">A custom-trained Convolutional Neural Network recognizes object color and predicts the corresponding conveyor destination. Routing is simulated in software.</p>
        </div>
      </Card>
      <h2 className="text-[18px] font-semibold">From image to intelligence</h2>
      <p className="mb-4 mt-1 text-[12px] text-muted">A focused five-stage computer vision pipeline.</p>
      <ol className="mb-8 grid gap-3 md:grid-cols-5">
        {STAGES.map(([t, d], i) => (
          <li key={t} className="relative">
            <Card className="h-full p-4">
              <p className="text-[10px] text-brand">0{i + 1}</p>
              <p className="my-3 text-[13px] font-semibold">{t}</p>
              <p className="text-[11px] leading-relaxed text-muted">{d}</p>
            </Card>
            {i < 4 && <ArrowRight size={12} className="absolute -right-[11px] top-1/2 z-10 hidden -translate-y-1/2 text-faint md:block" />}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Three colors. Three destinations.</h3>
          <ul className="space-y-3 text-[12px]">
            {CLASS_ORDER.map((c) => (
              <li key={c} className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-muted"><i className="h-1.5 w-1.5 rounded-full" style={{ background: CLASS_META[c].color }} />{c} plastic objects</span>
                <span style={{ color: CLASS_META[c].color }}>→ {CLASS_META[c].conveyor}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Built on a focused technology stack</h3>
          <div className="flex flex-wrap gap-2">{STACK.map((s) => <span key={s} className="rounded-md border border-line bg-app/60 px-3 py-2 text-[12px]">{s}</span>)}</div>
        </Card>
      </div>
    </div>
  );
}
