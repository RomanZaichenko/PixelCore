export default interface Tool {
  id: string
  name: string
  icon: string
  paint(data: string[]): void
}