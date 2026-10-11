import Layers from './components/Layers'
import SettingsBar from './components/SettingsBar'
import Toolbar from './components/Toolbar'
import CanvasArea from './components/CanvasArea'
import { SelectedParams } from './components/SelectedParams'

function App() {
  return (
    <div className="grid h-screen grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] overflow-hidden">
      <SettingsBar />
      <Toolbar />
      <CanvasArea />
      <SelectedParams />
      <Layers />
    </div>
  )
}

export default App
