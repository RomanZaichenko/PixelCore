import { useEffect } from 'react';
import Layers from './components/Layers';
import SettingsBar from './components/SettingsBar';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import MenuBar from './components/MenuBar';
import HomeScreen from './components/HomeScreen';
import NewDocumentDialog from './components/NewDocumentDialog';
import { useEditorStore } from './store/useEditorStore';
import { startAutosave } from './io/autosave';

function App() {
  const hasActiveDocument = useEditorStore((s) => s.activeDocumentId !== null);

  useEffect(() => startAutosave(), []);

  return (
    <>
      {hasActiveDocument ? (
        <div className="grid h-screen grid-cols-[52px_1fr_280px] grid-rows-[36px_44px_1fr] overflow-hidden bg-neutral-900 text-neutral-200">
          <MenuBar />
          <SettingsBar />
          <Toolbar />
          <CanvasArea />
          <Layers />
        </div>
      ) : (
        <HomeScreen />
      )}
      <NewDocumentDialog />
    </>
  );
}

export default App;
