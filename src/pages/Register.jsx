import { useState } from 'react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setToken(data.token);
      }
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>

        {!token ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="username" className="text-sm text-gray-600">
              Choose a username (3-20 letters, numbers or underscores)
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoComplete="off"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg py-2 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3">
              Save this token now. It is your login and it will not be shown
              again. If you lose it, you will need a new account.
            </p>
            <textarea
              readOnly
              value={token}
              rows={5}
              className="border border-gray-300 rounded-lg p-2 text-xs font-mono break-all"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 text-white rounded-lg py-2 font-medium"
            >
              {copied ? 'Copied!' : 'Copy token'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
