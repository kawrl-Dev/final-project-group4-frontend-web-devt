import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { saveToken } from '../lib/auth';
import { API_BASE } from '../lib/config';   // add
import FloatingBinary from '../components/FloatingBinary';
import bg from '../assets/home-page.png';

const glow = {textShadow: '0 0 0.05em #00ED64, 0 0 0.2em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A',};
const labelClass = 'text-brand-spring text-[clamp(1rem,1.6vw,1.25rem)]';
const inputClass = 'w-full border-2 border-brand-forest bg-brand-slate py-[0.6em] text-white caret-brand-spring focus:border-brand-spring focus:outline-none aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:border-red-400 text-[clamp(1rem,1.6vw,1.25rem)]';
const buttonClass = 'border-2 border-brand-spring bg-brand-spring py-[0.6em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState({ username: false, password: false });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const missing = { username: !username.trim(), password: !password };
    if (missing.username || missing.password) {
      setInvalid(missing);
      setError('Please fill in the highlighted fields.');
      return;
    }
    setInvalid({ username: false, password: false });

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username.trim())) {
      setInvalid({ username: true, password: false });
      setError('Username must be 3-20 letters, numbers, or underscores.');
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setError('Password must be 8-20 characters.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const messages = {
          400: 'Username must be 3-20 letters, numbers, or underscores and password must be 8-50 characters.',
          409: 'That username is not available.',
          429: 'Too many attempts. Try again later.',
        };
        setError(messages[res.status] || 'Registration failed');
      } else if (typeof data.token !== 'string' || !data.token) {
        setError('Registration failed');
      } else {
        saveToken(data.token);
        navigate('/menu', { replace: true});
        return;
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
      setShowPassword(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-6"
          style={{ backgroundImage: `url(${bg})` }}>
      <FloatingBinary />
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]"/>
        <section aria-labelledby="register" className="relative z-10 flex w-full max-w-xl flex-col gap-[clamp(0.75rem,2vh,1.25rem)] border-2 border-brand-spring bg-brand-evergreen/90 p-[clamp(1.25rem,3vw,2.5rem)] shadow-[8px_8px_0_0_#00684A]">
          <h1 id="register" className="font-pixel font-normal leading-[1.1] text-white text-[clamp(2rem,4.5vw,3.5rem)]" style={glow}>
            Register
          </h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input 
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setInvalid((v) => ({ ...v, username: false }));
                }}
                maxLength={20}
                autoComplete="off"
                aria-describedby="username-help"
                aria-invalid={invalid.username}
                className={`${inputClass} px-4`}/>
              <p id="username-help" className="text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                3-20 letters, numbers, or underscores
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setInvalid((v) => ({ ...v, password: false }));
                  }}
                  minLength={8}
                  maxLength={20}
                  autoComplete="off"
                  aria-describedby="password-help"
                  aria-invalid={invalid.password}
                  className={`${inputClass} pl-4 pr-12`}/>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-brand-spring focus-visible:text-brand-spring focus-visible:outline-none">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-[1.4em] w-[1.4em]">
                        {showPassword ? (
                          <>
                            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                            <path d="m2 2 20 20"/>
                          </>
                        ) : (
                          <>
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                            <circle cx="12" cy="12" r="3"/>
                          </>
                        )}
                    </svg>
                </button>
              </div>
                <p id="password-help" className="text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                  8-20 characters
                </p>
            </div>

            {error && (
              <p role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]">{error}</p>
            )}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <Link to="/" className="pt-2 text-center text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
              Cancel
            </Link>
          </form>
        </section>
    </main>
  );
}