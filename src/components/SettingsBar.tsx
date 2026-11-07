import { useEditorStore } from '../store/useEditorStore';

export default function SettingsBar() {
  const tool = useEditorStore((s) => s.tool);
  const color = useEditorStore((s) => s.color);
  const brushSize = useEditorStore((s) => s.brushSize);
  const setColor = useEditorStore((s) => s.setColor);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);

  return (
    <div className="col-span-3 col-start-1 row-start-2 flex items-center gap-6 border-b border-neutral-700 bg-neutral-800 px-3 text-sm">
      <label className="flex items-center gap-2">
        Колір
        <input
          type="color"
          value={color}
          disabled={tool === 'eraser'}
          onChange={(e) => setColor(e.target.value)}
          className="h-6 w-10 cursor-pointer rounded border border-neutral-600 bg-transparent p-0 disabled:opacity-40"
        />
      </label>

      <label className="flex items-center gap-2">
        Розмір
        <input
          type="range"
          min={1}
          max={200}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-40 accent-sky-500"
        />
        <output className="w-14 tabular-nums">{brushSize} px</output>
      </label>
    </div>
  );
}
