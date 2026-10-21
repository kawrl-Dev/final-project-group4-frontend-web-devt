export default function Spinner({ className = '' }) {
    return (
        <div role="status" className={className}>
            <div aria-hidden="true" className="h-[clamp(2.5rem,4vw,3.5rem)] w-[clamp(2.5rem,4vw,3.5rem)] animate-spin rounded-full border-4 border-brand-forest border-t-brand-spring drop-shadow-[0_0_6px_#00ED64] motion-reduce:animate-pulse"/>
            <span className="sr-only">Loading</span>
        </div>
    );
}