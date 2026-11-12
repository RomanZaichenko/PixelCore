export interface MenuItem {
  id: string
  label: string
  onSelect: () => void
  shortcut?: string
  disabled?: boolean
}
