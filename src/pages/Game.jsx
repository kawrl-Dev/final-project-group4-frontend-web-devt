import { useEffect } from 'react';
import { clearItemCache } from '../hooks/useItem';
import WindowProvider from '../context/WindowProvider';
import { useWindows } from '../hooks/useWindows';
import Desktop from '../components/game/Desktop';
import ExplorerWindow from '../components/game/ExplorerWindow';
import Taskbar from '../components/game/Taskbar';
import CluesWindow from '../components/game/CluesWindow';
import PauseMenu from '../components/game/PauseMenu';

const glow = { textShadow: '0 0 0.05em #22C55E, 0 0 0.2em #22C55E, 0 0 0.45em #15803D' };

function WindowLayer() {
  const { state, dispatch } = useWindows();
  if (state.openWindow?.id === 'explorer') {
    return <ExplorerWindow onClose={() => dispatch({ type: 'CLOSE' })} />;
  }
  if (state.openWindow?.id === 'clues') {
    return <CluesWindow onClose={() => dispatch({ type: 'CLOSE' })} />;
  }
  return null;
}

// Esc opens the pause menu. This listener only exists while the menu is closed;
// while it is open, PauseMenu listens for Esc itself (cancel confirm / resume).
function PauseLayer() {
  const { state, dispatch } = useWindows();
  const { paused } = state;

  useEffect(() => {
    if (paused) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !e.repeat) dispatch({ type: 'PAUSE' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paused, dispatch]);

  return paused ? <PauseMenu /> : null;
}

export default function Game() {
  useEffect(() => clearItemCache, []);
  return (
    <>
      {/* Narrow screens (under 1024px = Tailwind "lg") see only this message */}
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-center font-pixel text-xl text-green-300 lg:hidden" style={glow}>
        Use a bigger screen to play MinosDB.
      </main>

      <WindowProvider>
        <main
          className="relative hidden h-screen overflow-hidden bg-black lg:block"
        >
          {/* Green frame from the menu */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-6 z-0 border-2 border-green-500/45 shadow-[inset_0_0_24px_#22C55E]" />

          <Desktop />
          <WindowLayer />
          <Taskbar />
          <PauseLayer />

          {/* Scanlines (same as the menu). z-25 = above the windows (z-20) but below the
              taskbar (z-30) and the pause menu (z-40), so the score stays crisp. Not clickable. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-25" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 4px)' }} />
        </main>
      </WindowProvider>
    </>
  );
}