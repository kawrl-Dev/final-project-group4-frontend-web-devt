import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { clearItemCache, setCachedItem } from '../../hooks/useItem';
import { useWindows } from '../../hooks/useWindows';
import { loadFromSave } from '../../lib/gameState';
import { deleteSave, getSave, putSave } from '../../services/saveService';
import Window95, { RAISED } from './Window95';

const PRESS = 'active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white';
const buttonClass = `w-full bg-gray-300 px-3 py-1 text-black ${RAISED} ${PRESS} enabled:cursor-pointer disabled:cursor-not-allowed disabled:text-gray-500`;

const formatDate = (iso) => new Date(iso).toLocaleString();

function messageFor(err) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'notFound':
      return 'There is no save to load.';
    case 'forbidden':
      return 'You are not allowed to do that.';
    case 'badRequest':
      return `The server rejected the save: ${err.message}`;
    case 'server':
      return 'Something went wrong on the server (it may be waking up). Try again in a moment.';
    default:
      return 'Something went wrong. Try again.';
  }
}

function describe(info) {
  if (info.status === 'checking') return 'Checking for a save...';
  if (info.status === 'none') return 'No save yet.';
  if (info.status === 'exists') return `Last saved: ${formatDate(info.updatedAt)}`;
  return 'Could not check for a save.';
}

/**
 * The pause menu. Rendered by Game.jsx only while state.paused is true, so it
 * mounts fresh every time (and checks the server for a save on mount).
 * The server pause/resume calls are made by PauseLayer in Game.jsx, so Esc, the X,
 * Resume and Load all go through the same path.
 * It sits on top of the windows without touching them: Resume brings the
 * player back to exactly where they were.
 */
export default function PauseMenu() {
  const { state, dispatch } = useWindows();
  const navigate = useNavigate();

  // status: 'checking' | 'none' | 'exists' | 'error'
  const [info, setInfo] = useState({ status: 'checking', updatedAt: null });
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const controllerRef = useRef(null);
  const resumeRef = useRef(null);

  const resume = () => dispatch({ type: 'RESUME' });

  useEffect(() => {
    const controller = new AbortController();
    getSave(controller.signal)
      .then((data) => setInfo({ status: 'exists', updatedAt: data.updatedAt }))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setInfo({ status: err?.kind === 'notFound' ? 'none' : 'error', updatedAt: null });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  useEffect(() => {
    const previous = document.activeElement;
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    if (!confirm) resumeRef.current?.focus();
  }, [confirm]);

  /* 
    Esc: cancel the confirm step first, otherwise resume. Ignored while a
    request is running. (Game.jsx only listens for Esc while the menu is closed,
    so the two never fire on the same key press.)
   */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || e.repeat || busy) return;
      if (confirm) setConfirm(null);
      else dispatch({ type: 'RESUME' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, confirm, dispatch]);

  const run = async (action) => {
    setConfirm(null);
    setMessage(null);
    setBusy(true);
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      await action(controller.signal);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setMessage({ kind: 'error', text: messageFor(err) });
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const save = () =>
    run(async (signal) => {
      const res = await putSave(
        { solved: state.solved, readDocuments: state.readDocuments.map((d) => d.slug) },
        signal
      );
      dispatch({ type: 'SYNC', save: res });
      setInfo({ status: 'exists', updatedAt: res.updatedAt });
      setMessage({ kind: 'ok', text: 'Game saved.' });
    });

  const load = () =>
    run(async (signal) => {
      const data = await getSave(signal);
      clearItemCache();
      (data.items ?? []).forEach((item) => setCachedItem(item.slug, item));
      // LOAD closes this menu (paused becomes false). Game.jsx then resumes the server clock,
      // because the loaded save still has the pause that was recorded when this menu opened.
      dispatch(loadFromSave(data));
      if (data.finishedAt) dispatch({ type: 'FINISH' });
    });

  const remove = () =>
    run(async (signal) => {
      try {
        await deleteSave(signal);
      } catch (err) {
        if (err?.kind !== 'notFound') throw err;
      }
      clearItemCache();
      dispatch({ type: 'RESET' });
      setInfo({ status: 'none', updatedAt: null });
      setMessage({ kind: 'ok', text: 'Save deleted. Your run was reset.' });
    });

  const leave = () => navigate('/menu', { replace: true });

  const saveAndExit = () =>
    run(async (signal) => {
      await putSave(
        { solved: state.solved, readDocuments: state.readDocuments.map((d) => d.slug) },
        signal
      );
      navigate('/menu', { replace: true });
    });

  const checking = info.status === 'checking';
  const noSave = info.status === 'none';

  const confirmInfo = {
  save: {
    text: info.updatedAt
      ? `Overwrite your save from ${formatDate(info.updatedAt)}?`
      : 'Overwrite your existing save, if there is one?',
    label: 'Overwrite',
  },
  load: {
    text: 'Load your save? Progress since you last saved will be lost.',
    label: 'Load',
  },
  delete: {
    text: 'Delete your save? This cannot be undone, and your current run will restart from zero.',
    label: 'Delete',
  },
  menu: {
    text: 'Leave without saving? Unsaved progress will be lost.',
    label: 'Leave',
  },
}[confirm];

const runConfirmed = () => {
  if (confirm === 'save') save();
  else if (confirm === 'load') load();
  else if (confirm === 'delete') remove();
  else if (confirm === 'menu') leave();
};

  return (
    <div className="absolute inset-0 z-40">
      <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
      <Window95 title="Paused" size="h-auto w-96" onClose={() => !busy && resume()}>
        <div className="flex flex-col gap-3 p-3 text-black">
          <p role="status" className="text-sm">{describe(info)}</p>

          {state.pauseFailed && (
            <p role="status" className="border-l-4 border-amber-600 bg-amber-100 px-2 py-1 text-sm text-amber-900">
              Pause not recorded. The server clock is still running.
            </p>
          )}

          {busy && <p role="status" className="animate-pulse text-sm">Working...</p>}

          {message && (
            <p
              role={message.kind === 'error' ? 'alert' : 'status'}
              className={`border-l-4 px-2 py-1 text-sm ${
                message.kind === 'error'
                  ? 'border-red-600 bg-red-100 text-red-800'
                  : 'border-green-700 bg-green-100 text-green-900'
              }`}
            >
              {message.text}
            </p>
          )}

          {confirmInfo ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">{confirmInfo.text}</p>
              <div className="flex gap-2">
                {confirm === 'menu' && (
                  <button type="button" onClick={saveAndExit} className={buttonClass}>
                    Save & Exit
                  </button>
                )}
                <button type="button" onClick={runConfirmed} className={buttonClass}>
                  {confirmInfo.label}
                </button>
                <button type="button" autoFocus onClick={() => setConfirm(null)} className={buttonClass}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button ref={resumeRef} type="button" disabled={busy} onClick={resume} className={buttonClass}>
                Resume
              </button>
              <button
                type="button" disabled={busy || checking} onClick={() => (noSave ? save() : setConfirm('save'))} className={buttonClass} >
                Save game
              </button>
              <button
                type="button" disabled={busy || checking || noSave}
                onClick={() => setConfirm('load')} className={buttonClass}
              >
                Load game
              </button>
              <button
                type="button" disabled={busy || checking || noSave}
                onClick={() => setConfirm('delete')} className={buttonClass}
              >
                Delete save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm('menu')}
                className={buttonClass}
              >
                Main Menu
              </button>
            </div>
          )}

          <p className="text-xs text-gray-600">Press Esc to resume.</p>
        </div>
      </Window95>
    </div>
  );
}