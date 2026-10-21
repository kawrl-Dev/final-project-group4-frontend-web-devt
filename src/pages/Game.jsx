import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { clearItemCache, setCachedItem } from '../hooks/useItem';
import { getSave } from '../services/saveService';
import WindowProvider from '../context/WindowProvider';
import { useWindows } from '../hooks/useWindows';
import Desktop from '../components/game/Desktop';
import ExplorerWindow from '../components/game/ExplorerWindow';
import Taskbar from '../components/game/Taskbar';
import CluesWindow from '../components/game/CluesWindow';
import PauseMenu from '../components/game/PauseMenu';
import EndScreen from '../components/game/EndScreen';

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

function ResumeLayer() {
  const { state: routeState } = useLocation();
  const { dispatch } = useWindows();
  const resume = !!routeState?.resume;
  const [status, setStatus] = useState(resume ? 'loading' : 'done');

  useEffect(() => {
    if (!resume) return;
    const controller = new AbortController();
    getSave(controller.signal)
        .then((data) => {
          clearItemCache();
          (data.items ?? []).forEach((item) => setCachedItem(item.slug, item));
          dispatch({
            type: 'LOAD',
            solved: data.solved ?? [],
            readDocuments: data.readDocuments ?? [],
          });
          // A finished run goes straight to the end screen (LOAD resets
          // `finished`, so FINISH has to come after it).
          if (data.finishedAt) dispatch({ type: 'FINISH' });
          setStatus('done');
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return;
          // No save found just means a fresh game.
          setStatus(err?.kind === 'notFound' ? 'done' : 'error');
        });
    return () => controller.abort();
  }, [resume, dispatch]);

  if (status === 'done') return null;
  return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black font-pixel text-xl text-green-300" style={glow}>
        {status === 'loading' ? (
            <p role="status" className="animate-pulse">loading your save...</p>
        ) : (
            <>
              <p role="alert">Could not load your save.</p>
              <Link to="/menu" className="underline">Back to menu</Link>
            </>
        )}
      </div>
  );
}

function PauseLayer() {
  const { state, dispatch } = useWindows();
  const { paused, finished } = state;

  useEffect(() => {
    if (paused || finished) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !e.repeat) dispatch({ type: 'PAUSE' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paused, finished, dispatch]);

  return paused ? <PauseMenu /> : null;
}

function FinishLayer() {
  const { state } = useWindows();
  return state.finished ? <EndScreen /> : null;
}

export default function Game() {
  useEffect(() => clearItemCache, []);
  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-center font-pixel text-xl text-green-300 lg:hidden" style={glow}>
        Use a bigger screen to play MinosDB.
      </main>

      <WindowProvider>
        <main
          className="relative hidden h-screen overflow-hidden bg-black lg:block"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-6 z-0 border-2 border-green-500/45 shadow-[inset_0_0_24px_#22C55E]" />

          <Desktop />
          <WindowLayer />
          <Taskbar />
          <ResumeLayer />
          <PauseLayer />
          <FinishLayer />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-25" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 4px)' }} />
        </main>
      </WindowProvider>
    </>
  );
}