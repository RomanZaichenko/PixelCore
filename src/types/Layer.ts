
export type LayerFill = 'white' | 'transparent'
export default interface Layer {
  id: string
  name: string
  visible: boolean
  fill: LayerFill
}