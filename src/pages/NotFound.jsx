import { Link } from 'react-router';
import FloatingBinary from '../components/FloatingBinary';
import bg from '../assets/home-page.png';

const glow = { textShadow: '0 0 0.5em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A' };

// Shown for any address the app does not know (UAT bug B1: it used to be a blank page).
// "/" sends logged-in players on to /menu (see Skip), so one link covers both cases.
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-cover bg-center p-6 text-center" style={{ backgroundImage: `url(${bg})` }}>
      <FloatingBinary />
      <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]" />
      <h1 className="relative z-10 font-title font-normal leading-[1.1] text-white text-[clamp(2.5rem,9vw,7rem)]" style={glow}>
        404
      </h1>
      <p className="relative z-10 font-pixel text-brand-spring text-[clamp(1.25rem,3vw,2rem)]">
        That file does not exist.
      </p>
      <Link
        to="/"
        className="relative z-10 border-2 border-brand-spring px-6 py-[0.6em] font-pixel text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Back to the start
      </Link>
    </main>
  );
}
