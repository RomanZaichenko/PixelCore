import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export default function CanvasArea() {
  const doc = useEditorStore((s) =>
    s.documents.find((d) => d.id === s.activeDocumentId)
  );
  const areaRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });

  const docId = doc?.id;
  const width = doc?.width;
  const height = doc?.height;

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setArea({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (width === undefined || height === undefined) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [docId, width, height]);

  let displayWidth = 0;
  let displayHeight = 0;
  if (doc && area.width > 0 && area.height > 0) {
    const scale = Math.min(1, area.width / doc.width, area.height / doc.height);
    displayWidth = Math.round(doc.width * scale);
    displayHeight = Math.round(doc.height * scale);
  }

  return (
    <main
      ref={areaRef}
      className="col-start-2 row-start-3 grid min-h-0 min-w-0 place-items-center overflow-hidden bg-white"
    >
      {doc && displayWidth > 0 && (
        <canvas
          ref={canvasRef}
          width={doc.width}
          height={doc.height}
          style={{ width: displayWidth, height: displayHeight }}
          className="block"
        />
      )}
    </main>
  );
}
