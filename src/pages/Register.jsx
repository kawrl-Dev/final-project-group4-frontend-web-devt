import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { saveToken } from '../lib/auth';
import FloatingBinary from '../components/FloatingBinary';
import bg from '../assets/home-page.png';

const glow = {textShadow: '0 0 0.05em #00ED64, 0 0 0.2em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A',};
const labelClass = 'text-brand-spring text-[clamp(1rem,1.6vw,1.25rem)]';
const buttonClass = 'border-2 border-brand-spring bg-brand-spring py-[0.6em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 50) {
      setError('Password must be 8-50 characters.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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
        setToken(data.token);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-6"
          style={{ backgroundImage: `url(${bg})` }}>
      <FloatingBinary />
        <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]"/>
        <section aria-labelledby="register" className="relative z-10 flex w-full max-w-xl flex-col gap-[clamp(0.75rem,2vh,1.25rem)] border-2 border-brand-spring bg-brand-evergreen/90 p-[clamp(1.25rem,3vw,2.5rem)] shadow-[8px_8px_0_0_#00684A]">
          <div className="flex items-center gap-[clamp(0.75rem,2vw,1.5rem])">
            <Link to="/" aria-label="Back"className="px-5 text-white/70 hover:text-brand-spring focus-visible:text-brand-spring focus-visible:outline-none">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                shapeRendering="crispEdges"
                aria-hidden="true"
                className="h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)]">
                <path d="M11 1h3v14h-3z M8 3h3v10H8z M5 5h3v6H5z M2 7h3v2H2z" />
                </svg>
            </Link>
            <h1 id="register" className="font-pixel font-normal leading-[1.1] text-white text-[clamp(2rem,4.5vw,3.5rem)]" style={glow}>
              Register
            </h1>
          </div>

            {!token ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
                <div className="flex flex-col gap-2">
                  <label htmlFor="username" className={labelClass}>
                    Username
                  </label>
                  <input 
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    autoComplete="off"
                    aria-describedby="username-help"
                    className="w-full border-2 border-brand-forest bg-brand-slate px-4 py-[0.6em] text-white caret-brand-spring focus:border-brand-spring focus:outline-none text-[clamp(1rem,1.6vw,1.25rem)]"/>
                  <p id="username-help" className="text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                    3-20 letters, numbers, or underscores
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={50}
                    autoComplete="new-password"
                    aria-describedby="password-help"
                    className="w-full border-2 border-brand-forest bg-brand-slate px-4 py-[0.6em] text-white caret-brand-spring focus:border-brand-spring focus:outline-none text-[clamp(1rem,1.6vw,1.25rem)]"/>
                    <p id="password-help" className="text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
                      8-50 characters
                    </p>
                </div>

                {error && (
                  <p role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]">{error}</p>
                )}

                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
                <p className="border-2 border-dashed border-amber-300 bg-amber-300/10 p-4 text-amber-200 text-[clamp(1rem,1.8vw,1.5rem)]">
                  Save this token now. It is your login and it will not be shown
                  again. If you lose it, you will need a new account.
                </p>

                <div className="flex flex-col gap-2">
                  <label htmlFor="token" className={labelClass}>Token</label>
                  <textarea
                    id="token"
                    readOnly
                    value={token}
                    rows={3}
                    spellCheck={false}
                    onFocus={(e) => e.target.select()}
                    className="w-full resize-none break-all border-2 border-brand-forest bg-brand-slate p-4 text-brand-spring focus:border-brand-spring focus:outline-none text-[clamp(0.75rem,1.2vw,1rem)]"/>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button onClick={handleCopy} className={buttonClass}>
                    {copied ? 'Copied!' : 'Copy token'}
                  </button>
                  <button onClick={() => {
                    setToken('');
                    navigate('/menu');
                  }}
                  className="border-2 border-brand-spring py-[0.6em] text-brand-spring text-[clamp(0.875rem,1.3vw,1rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Continue
                  </button>
                </div>
              </div>
            )}
          </section>
      </main>
  );
}