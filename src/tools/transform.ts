import { getTransformBox, setTransformBox } from '../core/transform'
import {
  hitTest,
  moveBox,
  resizeBox,
  rotateBox,
  type Hit,
} from '../core/transformMath'
import type Point from '../types/Point'
import type Tool from '../types/Tool'
import type { TransformBox } from '../types/Transform'

interface Drag {
  hit: Hit
  startPointer: Point
  startBox: TransformBox
}

export function createTransformTool(): Tool {
  let drag: Drag | null = null

  return {
    type: 'transform',
    label: 'Трансформація',
    hotkey: 'V',
    cursor: 'default',
    isModifiesPixels: false,

    onDown(ctx, e) {
      const box = getTransformBox()
      if (!box) return
      const hit = hitTest(box, e.point, ctx.zoom)
      if (!hit) return
      drag = { hit, startPointer: e.point, startBox: box }
    },

    onMove(_ctx, e) {
      if (!drag) return
      const { hit, startPointer, startBox } = drag

      switch (hit.kind) {
        case 'move':
          setTransformBox(moveBox(startBox, startPointer, e.point))
          break
        case 'rotate':
          setTransformBox(rotateBox(startBox, startPointer, e.point, e.shiftKey))
          break
        case 'handle':
          setTransformBox(
            resizeBox(
              startBox,
              hit.handle.hx,
              hit.handle.hy,
              e.point,
              e.shiftKey,
              e.altKey,
            ),
          )
          break
      }
    },

    onUp() {
      drag = null
    },

    onCancel() {
      if (drag) setTransformBox(drag.startBox)
      drag = null
    },
  }
}