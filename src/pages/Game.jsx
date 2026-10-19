import { useState } from 'react';
import bg from '../assets/home-page.png';
import WindowProvider from '../context/WindowProvider';
import { useWindows } from '../hooks/useWindows';
import Desktop from '../components/game/Desktop';
import ExplorerWindow from '../components/game/ExplorerWindow';
import Taskbar from '../components/game/Taskbar';

const glow = { textShadow: '0 0 0.05em #22C55E, 0 0 0.2em #22C55E, 0 0 0.45em #15803D' };

// Decides which window to draw based on the reducer state.
function WindowLayer() {
  const { state, dispatch } = useWindows();
  if (state.openWindow?.id === 'explorer') {
    return <ExplorerWindow onClose={() => dispatch({ type: 'CLOSE' })} />;
  }
  return null;
}

export default function Game() {
  const [blackBg, setBlackBg] = useState(false); // dev only

  return (
    <>
      {/* Narrow screens (under 1024px = Tailwind "lg") see only this message */}
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-center font-pixel text-xl text-green-300 lg:hidden" style={glow}>
        Use a bigger screen to play MinosDB.
      </main>

      <WindowProvider>
        <main
          className="relative hidden h-screen overflow-hidden bg-cover bg-center lg:block"
          style={blackBg ? { backgroundColor: '#000' } : { backgroundImage: `url(${bg})`}}
        >
          {/* Green frame from the menu */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-6 z-0 border-2 border-green-500/45 shadow-[inset_0_0_24px_#22C55E]" />

          <Desktop />
          <WindowLayer />
          <Taskbar />

          {/* TEMPORARY dev button: not rendered in production builds */}
          {import.meta.env.DEV && (
            <div className="absolute right-10 top-10 z-40 flex items-center gap-2 text-xs text-green-600">
              <span>dev: background</span>
              <button
                type="button"
                onClick={() => setBlackBg((b) => !b)}
                className="rounded border border-green-700 px-2 py-1 hover:border-green-400"
              >
                {blackBg ? 'menu image' : 'black'}
              </button>
            </div>
          )}

          {/* Scanlines (same as the menu), on top of everything but not clickable */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-50" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 4px)' }} />
        </main>
      </WindowProvider>
    </>
  );
}
