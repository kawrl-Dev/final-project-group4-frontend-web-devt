import { Link } from 'react-router';
import { usePWA } from './hooks/usePWA';
import bg from './assets/home-page.png';
import FloatingBinary from './components/FloatingBinary';

const glow = { textShadow: '0 0 0.05em #22C55E, 0 0 0.2em #22C55E, 0 0 0.45em #15803D', };
const linkGlow = { textShadow: '0 0 0.2em #16A34A' };

function MenuLink({ to, children }) {
  return (
    <Link
      to={to}
      style={linkGlow}
      className="group relative font-pixel text-green-200 leading-[1.1] text-[clamp(1.75rem,5vw,4.5rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
        <span aria-hidden="true" className="pointer-events-none absolute right-full top-0 bottom-0 mr-[0.3em] flex items-center opacity-0 -translate-x-2 transition duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            shapeRendering="crispEdges"
            className="h-[0.6em] w-[0.6em] drop-shadow-[0_0_6px_#16A34A]">
              <path d="M2 1h3v14H2z M5 3h3v10H5z M8 5h3v6H8z M11 7h3v2h-3z"/>
            </svg>
        </span>
        {children}
      </Link>
  );
}

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}>
          <FloatingBinary />

          <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-green-500/45 shadow-[inset_0_0_24px_#22C55E]"/>
          <h1 className="relative z-10 text-center font-title font-normal leading-[1.1] text-green-100 text-[clamp(3rem,13vw,14rem)]"
              style={glow}>MinosDB</h1>
          <nav className="relative z-10 mt-[2.5vw] flex flex-col items-center gap-1">
            <MenuLink to="/register">Register</MenuLink>
            <MenuLink to="/login">Log In</MenuLink>
          </nav>
          <p className="absolute inset-x-0 bottom-11 z-10 flex items-center justify-center gap-2 font-pixel text-[clamp(0.875rem,1.5vw,1.375rem)] text-green-300">
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
              <path d="M14.38 14.38a4 4 0 1 1 0-5.66"/>
            </svg>
             2026 REMless Studio. All rights reserved.
          </p>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 4px)', }}/>
    </main>
  );
}