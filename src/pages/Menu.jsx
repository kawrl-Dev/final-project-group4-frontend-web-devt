import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { authFetch, clearToken, getToken } from '../lib/auth';
import FloatingBinary from '../components/FloatingBinary';
import bg from '../assets/home-page.png';
import Settings from '../components/Settings';

const items = [
    { label: 'New Game', to: '/game' },
    { label: 'Load Game', to: '/load' },
    { label: 'Leaderboard', to: '/leaderboard'},
];

const glow = {
    textShadow: '0 0 0.5em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A',
};
const linkGlow = { textShadow: '0 0 0.2em #00684A' };

const VERIFY_URL = '/api/auth/me';

function Arrow() {
    return (
        <span aria-hidden="true" className="pointer-events-none absolute right-full top-0 bottom-0 mr-[0.3em] flex items-center opacity-0 -translate-x-2 transition duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0">
            <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                shapeRendering="crispEdges"
                className="h-[0.6em] w-[0.6em]">
                <path d="M2 1h3v14H2z M5 3h3v10H5z M8 5h3v6H8z M11 7h3v2h-3z"/>
            </svg>
        </span>
    );
}

export default function Menu() {
    const navigate = useNavigate();
    const dialogRef = useRef(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'unauth'));

    const verify = useCallback(async (signal) => {
        try {
            const res = await authFetch(VERIFY_URL, { signal });
            if (res.ok) setStatus('authed');
            else if (res.status === 401 || res.status === 403) {
                clearToken();
                setStatus('unauth');
            } else setStatus('error');
        } catch (err) {
            if (err.name !== 'AbortError') setStatus('error');
        }
    }, []);

    useEffect(() => {
        if (!getToken()) return;

        const controller = new AbortController();
        verify(controller.signal);

        const onPageShow = (e) => {
            if (!e.persisted) return;
            if (!getToken()) {
                setStatus('unauth');
                return;
            }
            setStatus('checking');
            verify();
        };
        window.addEventListener('pageshow', onPageShow);

        return() => {
            controller.abort();
            window.removeEventListener('pageshow', onPageShow);
        };
    }, [verify]);

    const handleLogout = () => {
        clearToken();
        navigate('/', { replace: true });
    };

    if (status === 'unauth') return <Navigate to="/" replace/>;

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center p-6"
            style={{ backgroundImage: `url(${bg})` }}>
            <FloatingBinary />
            <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]"/>

            {status === 'checking' && (
                <p role="status" className="relative z-10 font-pixel text-xl text-brand-spring">
                    Loading...
                </p>
            )}

            {status === 'error' && (
                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <p role="alert" className="font-pixel text-xl text-white">
                        Could not reach the server.
                    </p>
                    <button onClick={() => {
                        setStatus('checking');
                        verify();
                    }}
                    className="border-2 border-brand-spring px-4 py-2 font-pixel text-brand-spring hover:bg-brand-spring hover:text-brand-slate">
                        Try Again
                    </button>
                </div>
            )}

            {status === 'authed' && (
                <>
                    <h1 className="relative z-10 text-center font-title font-normal leading-[1.1] text-white text-[clamp(2.5rem,9vw,8rem)]" style={glow}>
                        MinosDB
                    </h1>
                    
                    <nav aria-label="Main Menu" className="relative z-10 mt-[2.5vw] flex flex-col items-center gap-2">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                to={item.to}
                                style={linkGlow}
                                className="group relative font-pixel text-brand-spring leading-[1.1] text-[clamp(1.5rem,4vw,3.5rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
                                    <Arrow />
                                    {item.label}
                            </Link>
                        ))}

                        <button
                            onClick={() => setSettingsOpen(true)}
                            style={linkGlow}
                            className="group relative font-pixel text-brand-spring leading-[1.1] text-[clamp(1.5rem,4vw,3.5rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
                                <Arrow />
                                Settings
                            </button>

                        <button
                            onClick={() => dialogRef.current?.showModal()}
                            style={linkGlow}
                            className="group relative font-pixel text-brand-spring leading-[1.1] text-[clamp(1.5rem,4vw,3.5rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
                                <Arrow />
                                Log Out
                        </button>
                    </nav>

                    <dialog
                        ref={dialogRef}
                        aria-labelledby="logout-title"
                        className="m-auto w-[min(90vw,28rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2rem)] text-white shadow-[8px_8px_0_0_#00684A] backdrop:bg-black/70">
                        <h2 id="logout-title" className="font-pixel font-normal text-white text-[clamp(1.5rem,3vw,2rem)]">
                            Log out?
                        </h2>
                        <p className="mt-2 text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                            You need to log in again after.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => dialogRef.current?.close()}
                                className="border-2 border-brand-spring py-[0.6em] text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                                    Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="border-2 border-brand-spring bg-brand-spring py-[0.6em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                                    Log Out
                            </button>
                        </div>
                    </dialog>
                    <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
                </>
            )}

            <p className="absolute inset-x-0 bottom-11 z-10 flex items-center justify-center gap-2 font-pixel text-[clamp(0.875rem,1.5vw,1.375rem)] text-brand-spring/80">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[1em] w-[1em] shrink-0"
                    role="img"
                    aria-label="Copyright">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M14.83 14.83a4 4 0 1 1 0-5.66"/>
                </svg>
                2026 REMless Studio. All rights reserved.
            </p>
        </main>
    )
}