import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { authFetch, clearToken, getToken } from '../lib/auth';
import FloatingBinary from '../components/FloatingBinary';
import bg from '../assets/home-page.png';
import Spinner from '../components/Spinner';

const SAVE_URL = '/api/saves/me';
const PLAY_ROUTE = '/game';

const glow = {textShadow: '0 0 0.5em #00ED64, 0 0 0.2em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A',};
const buttonClass = 'border-2 border-brand-spring bg-brand-spring py-[0.6em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const outlineClass = 'border-2 border-brand-spring py-[0.6em] text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';

export default function Load() {
    const navigate = useNavigate();
    const dialogRef = useRef(null);
    const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'unauth'));
    const [save,setSave] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const loadSave = useCallback(async (signal) => {
        try {
            const res = await authFetch(SAVE_URL, { signal });
            if (res.status === 404) {
                setSave(null);
                setStatus('empty');
                return;
            }
            if (res.status === 401 || res.status === 403) {
                clearToken();
                setStatus('unauth');
                return;
            }
            if (!res.ok) {
                setStatus('error');
                return;
            }
            const data = await res.json().catch(() => null);
            if (!data || typeof data.location !== 'string') {
                setStatus('error');
                return;
            }
            setSave({
                location: data.location,
                solvedCount: Array.isArray(data.solved) ? data.solved.length : 0,
                wrongGuesses: Number.isFinite(data.wrongGuesses) ? data.wrongGuesses : 0,
            });
            setStatus('ready');
        } catch (err) {
            if (err.name !== 'AbortError') setStatus('error');
        }
    }, []);

    useEffect(() => {
        if (!getToken()) return;
        const controller = new AbortController();
        loadSave(controller.signal);
        return () => controller.abort();
    }, [loadSave]);

    const handleDelete = async () => {
        setBusy(true);
        setError('');
        try {
            const res = await authFetch(SAVE_URL, { method: 'DELETE' });
            if (res.status === 401 || res.status === 403) {
                clearToken();
                setStatus('unauth');
                return;
            }
            if (!res.ok && res.status !== 404) {
                setError('Could not delete the save. Try again.')
                return;
            }
            setSave(null);
            setStatus('empty');
         } catch { 
            setError('Could not reach the server.');
         } finally {
            setBusy(false);
            dialogRef.current?.close();
         }
    };

    if (status === 'unauth') return <Navigate to="/" replace />;

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-6" style={{ backgroundImage: `url(${bg})`}}>
        <FloatingBinary />
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]"/>
        <section aria-labelledby="load" className="relative z-10 flex w-full max-w-xl flex-col gap-[clamp(0.75rem,2vh,1.25rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2.5rem)] shadow-[8px_8px_0_0_#00684A]">
            <h1 id="load" className="font-pixel font-normal leading-[1.1] text-white text-[clamp(2rem,4.5vw,3.5rem)]" style={glow}>
                Load Game
            </h1>

            {status === 'loading' && <Spinner className="self-center py-4"/>}

            {status === 'error' && (
                <>
                    <p role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]">
                        Could not load your save.
                    </p>
                    <button onClick={() => {
                        setStatus('loading');
                        loadSave();
                    }}
                    className={buttonClass}>
                        Try Again
                    </button>
                </>
            )}

            {status === 'empty' && (
                <>
                    <p className="text-white/80 text-[clamp(1rem,1.6vw,1.25rem)]">
                        No saved game found.
                    </p>
                    <button onClick={() => navigate(PLAY_ROUTE)} className={buttonClass}>
                        New Game
                    </button>
                </>
            )}

            {status === 'ready' && save && (
                <>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[clamp(1rem,1.6vw,1.25rem)]">
                        <dt className="text-brand-spring">Location</dt>
                        <dd className="break-all text-white">{save.location}</dd>
                        <dt className="text-brand-spring">Solved</dt>
                        <dd className="text-white">{save.solvedCount}</dd>
                        <dt className="text-brand-spring">Wrong Guesses</dt>
                        <dd className="text-white">{save.wrongGuesses}</dd>
                    </dl>

                    {error && (
                        <p role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]">{error}</p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <button onClick={() => navigate(PLAY_ROUTE, { state: { slug: save.location } })} className={buttonClass}>
                            Continue
                        </button>
                        <button onClick={() => dialogRef.current?.showModal()} disabled={busy} className={outlineClass}>
                            Delete Save
                        </button>
                    </div>
                </>
            )}

            <Link to="/menu" className="pt-2 text-center text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:outline-none">
                Back to Menu
            </Link>
        </section>

        <dialog ref={dialogRef} aria-labelledby="delete-title" className="m-auto w-[min(90vw,28rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2rem)] text-white shadow-[8px_8px_0_0_#00684A] backdrop:bg-black/70">
            <h2 id="delete-title" className="font-pixel font-normal text-white text-[clamp(1.5rem,3vw,2rem)]">
                Delete your save?
            </h2>
            <p className="mt-2 text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                This cannot be undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <button onClick={() => dialogRef.current?.close()} className={outlineClass}>
                    Cancel
                </button>
                <button onClick={handleDelete} disabled={busy} className={buttonClass}>
                    {busy ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </dialog>
        </main>
    );
}