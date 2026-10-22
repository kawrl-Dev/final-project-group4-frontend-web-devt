import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAdminUsers } from '../hooks/useAdminUsers';
import FloatingBinary from '../components/FloatingBinary';
import Spinner from '../components/Spinner';
import bg from '../assets/home-page.png';

const glow = { textShadow: '0 0 0.5em #00ED64, 0 0 0.2em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A' };
const buttonClass = 'border-2 border-brand-spring bg-brand-spring px-4 py-[0.5em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const outlineClass = 'border-2 border-brand-spring px-4 py-[0.5em] text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const alertClass = 'border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]';
const inputClass = 'w-full border-2 border-brand-forest bg-brand-slate px-4 py-[0.6em] text-white caret-brand-spring focus:border-brand-spring focus:outline-none text-[clamp(1rem,1.6vw,1.25rem)]';
const cell = 'px-4 py-2';
const smallText = 'text-[clamp(0.75rem,1.1vw,0.875rem)]';

function messageFor(err, fallback) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Please log in again.';
    case 'forbidden':
      return err.message || 'You are not allowed to do that.';
    case 'notFound':
      return 'That user no longer exists. Refresh the list.';
    case 'badRequest':
      return err.message || 'That request was not accepted.';
    case 'server':
      return 'Something went wrong on the server (it may be waking up). Try again in a moment.';
    default:
      return fallback;
  }
}

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

function UsersTable({ users, onDelete }) {
  return (
    <table className="w-full min-w-120 text-left text-sm">
      <caption className="sr-only">Registered users</caption>
      <thead className="border-b-2 border-brand-spring font-pixel text-brand-spring">
        <tr>
          <th scope="col" className={`${cell} font-normal`}>Username</th>
          <th scope="col" className={`${cell} font-normal`}>Role</th>
          <th scope="col" className={`${cell} font-normal`}>Joined</th>
          <th scope="col" className={`${cell} text-right font-normal`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const isAdminRow = u.role === 'admin';
          return (
            <tr key={u._id} className="border-b border-brand-forest text-white hover:bg-brand-spring/5">
              <td className={`${cell} break-all`}>{u.username}</td>
              <td className={`${cell} ${isAdminRow ? 'text-brand-spring' : 'text-white/70'}`}>{u.role}</td>
              <td className={`${cell} text-white/70`}>{formatDate(u.createdAt)}</td>
              <td className={`${cell} text-right`}>
                {isAdminRow ? (
                  <span className={`text-white/60 ${smallText}`}>Protected</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDelete(u)}
                    aria-label={`Delete user ${u.username}`}
                    className={`border-2 border-red-400 px-2 py-0.5 text-red-300 hover:bg-red-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${smallText}`}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AdminUsers() {
  const { users, loading, error, waking, refetch, removeUser } = useAdminUsers();
  const dialogRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (pending && !d.open) d.showModal();
    if (!pending && d.open) d.close();
  }, [pending]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => u.username.toLowerCase().includes(q)) : users;
  }, [users, query]);

  const handleConfirm = async () => {
    if (!pending) return;
    const target = pending;
    setDeleting(true);
    setActionError(null);
    setNotice('');
    try {
      await removeUser(target._id);
      setNotice(`Deleted ${target.username}.`);
    } catch (err) {
      setActionError(messageFor(err, 'Could not delete that user. Try again.'));
    } finally {
      setPending(null);
      setDeleting(false);
    }
  };

  const ready = !loading && !error;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-6" style={{ backgroundImage: `url(${bg})` }}>
      <FloatingBinary />
      <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]" />
      <section aria-labelledby="admin-users" className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col gap-[clamp(0.75rem,2vh,1.25rem)] overflow-y-auto border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2.5rem)] shadow-[8px_8px_0_0_#00684A]">
        <div>
          <h1 id="admin-users" className="font-pixel font-normal leading-[1.1] text-white text-[clamp(2rem,4.5vw,3.5rem)]" style={glow}>
            Manage Users
          </h1>
          <p className="mt-1 text-white/70 text-[clamp(0.875rem,1.3vw,1rem)]">Admin View</p>
        </div>

        {notice && (
          <p role="status" className="border-l-4 border-brand-spring bg-brand-spring/10 px-4 py-3 text-brand-spring text-[clamp(0.875rem,1.3vw,1rem)]">{notice}</p>
        )}
        {actionError && (
          <p role="alert" className={alertClass}>{actionError}</p>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner />
            {waking && (
              <p className="text-white/70 text-[clamp(0.875rem,1.3vw,1rem)]">Please wait a moment.</p>
            )}
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="flex flex-col gap-3">
            <p className={alertClass}>{messageFor(error, 'Could not load the users.')}</p>
            <button type="button" onClick={refetch} className={buttonClass}>Try Again</button>
          </div>
        )}

        {ready && (
          <div className="flex flex-col gap-2">
            <label htmlFor="user-search" className="sr-only">Search by username</label>
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username"
              autoComplete="off"
              maxLength={20}
              className={inputClass}
            />
            <p role="status" className={`text-white/60 ${smallText}`}>
              {query.trim() ? `${visible.length} of ${users.length} users` : `${users.length} users`}
            </p>
          </div>
        )}

        {ready && users.length === 0 && (
          <p className="text-white/80 text-[clamp(1rem,1.6vw,1.25rem)]">No users yet.</p>
        )}

        {ready && users.length > 0 && visible.length === 0 && (
          <p className="text-white/80 text-[clamp(1rem,1.6vw,1.25rem)]">No users match &ldquo;{query.trim()}&rdquo;.</p>
        )}

        {ready && visible.length > 0 && (
          <div className="overflow-x-auto">
            <UsersTable users={visible} onDelete={setPending} />
          </div>
        )}

        <Link
          to="/menu"
          className="pt-2 text-center text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:text-white focus-visible:outline-none"
        >
          Back to Menu
        </Link>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setPending(null)}
        aria-labelledby="delete-user-title"
        className="m-auto w-[min(90vw,28rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2rem)] text-white shadow-[8px_8px_0_0_#00684A] backdrop:bg-black/70"
      >
        <h2 id="delete-user-title" className="font-pixel font-normal text-white text-[clamp(1.5rem,3vw,2rem)]">
          Delete user?
        </h2>
        <p className="mt-2 wrap-break-word text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
          {pending ? `This permanently removes ${pending.username}'s account, their saved game, and their leaderboard scores. This cannot be undone.` : ''}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button type="button" onClick={() => dialogRef.current?.close()} disabled={deleting} className={outlineClass}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={deleting} className={buttonClass}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </dialog>
    </main>
  );
}
