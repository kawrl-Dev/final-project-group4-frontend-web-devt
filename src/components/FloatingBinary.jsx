import { useMemo } from 'react';

const PER_SIDE = 4;
const BITS = 40;

const makeBits = () => Array.from({ length: BITS }, () => (Math.random() > 0.5 ? '1' : '0')).join('');

export default function FloatingBinary() {
    const columns = useMemo(() => ['left', 'right'].flatMap((side) =>
        Array.from({ length: PER_SIDE }, (_, i) => {
            const bits = makeBits();
            return {
                key: `${side}-${i}`, side,
                offset: `${2 + i * 3.2}vw`,
                duration: 22 + Math.random() * 20,
                delay: -Math.random() * 30,
                opacity: 0.25 + Math.random() * 0.45,
                text: bits + bits,
            };
        })),
    []);

return (
    <div aria-hidden="true" className="binary-mask pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
        {columns.map((c) => (
            <div
                key={c.key}
                className="binary-col absolute top-0 w-[1ch] whitespace-pre-wrap break-all font-mono text-lg leading-6 text-brand-spring"
                style={{
                    [c.side]: c.offset,
                    opacity: c.opacity,
                    animationDuration: `${c.duration}s`,
                    animationDelay: `${c.delay}s`,
                }}>
                {c.text}
                </div>
            ))}
        </div>
    );
}