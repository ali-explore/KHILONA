export type ClassName = "Blue" | "Yellow" | "Purple";

export interface ClassMeta {
  name: ClassName;
  color: string;
  conveyor: string;
  letter: "A" | "B" | "C";
  lane: string; // "Conveyor 01" etc.
}

/** Single source of truth for class -> conveyor routing on the client (mirrors backend dictionary). */
export const CLASS_META: Record<ClassName, ClassMeta> = {
  Blue: { name: "Blue", color: "#3b82f6", conveyor: "Conveyor Belt A", letter: "A", lane: "Conveyor 01" },
  Yellow: { name: "Yellow", color: "#facc15", conveyor: "Conveyor Belt B", letter: "B", lane: "Conveyor 02" },
  Purple: { name: "Purple", color: "#a855f7", conveyor: "Conveyor Belt C", letter: "C", lane: "Conveyor 03" },
};
export const CLASS_ORDER: ClassName[] = ["Blue", "Yellow", "Purple"];

export const isClassName = (v: string): v is ClassName => v in CLASS_META;
