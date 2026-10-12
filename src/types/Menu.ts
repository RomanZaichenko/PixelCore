import type { MenuItem } from './MenuItem'

export interface Menu {
  id: string
  label: string
  items: MenuItem[]
}