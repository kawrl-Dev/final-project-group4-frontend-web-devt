import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { authFetch, clearToken } from '../lib/auth';
import { getSettings, resetSettings, saveSettings } from '../lib/settings';

const SAVE_URL = '/api/saves/me';

const labelClass = 'text-brand-spring text-[clamp(1.25rem,2.2vw,1.75rem)]';
const hintClass = 'text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]';
const rowClass = 'flex flex-col gap-3 border-t-2 border-brand-forest pt-4 sm:flex-row sm:items-center sm:justify-between';
const buttonClass = 'border-2 border-brand-spring bg-brand-spring px-4 py-[0.6em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const outlineClass = 'border-2 border-brand-spring px-4 py-[0.6em] text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';

function Toggle({ id, label, hint, checked, onChange }) {
    return (
        <div className={rowClass}>
            <div>
                <p id={id} className={labelClass}>{label}</p>
                <p className={hintClass}>{hint}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={id}
                onClick={() => onChange(!checked)}
                className={`${checked ? outlineClass : buttonClass} min-w-24`}>
                    {checked ? 'Off' : 'On'}
            </button>
        </div>
    );
}

function Slider({ id, label, hint, value, min, max, step, format, onChange }) {
    return (
        <div className="flex flex-col gap-2 border-t-2 border-brand-forest pt-4">
            <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={id} className={labelClass}>{label}</label>
                <span aria-hidden="true" className="text-white text-[clamp(1rem,1.6vw,1.25rem)]">{format(value)}</span>
            </div>
            <p className={hintClass}>{hint}</p>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={format(value)}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-brand-spring"/>
        </div>
    );
}

export default function SettingsDialog({ open, onClose, showSaveDelete = true }) {
    const navigate = useNavigate();
    const ref = useRef(null);
    const [s, setS] = useState(() => getSettings());
    const [confirming, setConfirming] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) {setS(getSettings()); d.showModal();}
        if (!open && d.open) d.close();
    }, [open]);

    const handleClose = () => {
        setConfirming(false);
        setNotice('');
        setError('');
        onClose();
    };
    
    const update = (patch) => {
        saveSettings(patch);
        setS(getSettings());
    };

    const handleReset = () => {
        resetSettings();
        setS(getSettings());
    };

    const handleDelete = async () => {
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const res = await authFetch(SAVE_URL, { method: 'DELETE' });
            if (res.status === 401 || res.status === 403) {
                clearToken();
                navigate('/', { replace: true });
                return;
            }
            if (res.status === 404) setNotice('You have no saved game.');
            else if (!res.ok) setError('Could not delete the save. Try again.');
            else setNotice('Your saved game was deleted.');
        } catch {
            setError('Could not reach the server.');
        } finally {
            setBusy(false);
            setConfirming(false);
        }
    };

    return (
        <dialog ref={ref} onClose={handleClose} aria-labelledby="settings-title" className="m-auto w-[min(92vw,32rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2rem)] text-white shadow-[8px_8px_0_0_#00684A] backdrop:bg-black/70">
            <h2 id="settings-title" className="font-pixel font-normal text-white text-[clamp(1.75rem,3.5vw,2.5rem)]">
                Settings
            </h2>

            <div className="mt-4 flex flex-col gap-4">
                <Slider
                    id="brightness"
                    label="Brightness"
                    value={s.brightness}
                    min={50}
                    max={150}
                    step={5}
                    format={(v) => `${v}%`}
                    onChange={(v) => update({ brightness: v })}/>
                
                <h3 className="border-t-2 border-brand-forest pt-4 font-pixel font-normal text-white text-[clamp(1.25rem,2.4vw,1.75rem)]">
                    Accessibility
                </h3>

                <Toggle
                    id="reduce-motion"
                    label="Reduce Motion"
                    hint="Stops the floating binary."
                    checked={s.reduceMotion}
                    onChange={(v) => update({ reduceMotion: v })}/>
                <Toggle
                    id="reduce-glow"
                    label="Reduce Glow"
                    hint="Removes the glowing effect on text."
                    checked={s.reduceGlow}
                    onChange={(v) => update({ reduceGlow: v })}/>
                
                {showSaveDelete && (
                    <div className={rowClass}>
                        <div>
                            <p className={labelClass}>Delete Game</p>
                            <p className={hintClass}>{confirming ? 'Delete your save?' : 'Start over.'}</p>
                        </div>
                        {confirming ? (
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setConfirming(false)} className={outlineClass}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDelete} disabled={busy} className={buttonClass}>
                                    {busy ? 'Deleting...' : 'Confirm'}
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setConfirming(true)} className={outlineClass}>
                                Delete
                            </button>
                        )}
                    </div>
                )}

                {notice && (
                    <p role="status" className="border-l-4 border-brand-spring bg-brand-spring/10 px-4 py-3 text-brand-spring text-[clamp(0.875rem,1.3vw,1rem)]">{notice}</p>
                )}
                {error && (
                    <p role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]">{error}</p>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-brand-forest pt-4">
                <button type="button" onClick={handleReset} className="text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
                    Reset to Default
                </button>
                <button type="button" onClick={() => ref.current?.close()} className="text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
                    Close
                </button>
            </div>
        </dialog>
    );
}