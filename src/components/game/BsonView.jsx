// Pretty-prints a BSON-style document as colored, indented JSON-like text.
// Built only from React elements (no dangerouslySetInnerHTML, no libraries).
// Colors: keys green-300, strings amber-300, numbers cyan-300,
// booleans/null fuchsia-400, ObjectId(...) sky-300, punctuation green-700.

const isObjectId = (v) =>
  typeof v === 'string' && v.startsWith("ObjectId('") && v.endsWith("')");

function Punct({ children }) {
  return <span className="text-green-700">{children}</span>;
}

function Key({ name }) {
  return (
    <>
      <span className="text-green-300">"{name}"</span>
      <Punct>: </Punct>
    </>
  );
}

// string, number, boolean, null
function Scalar({ value }) {
  if (isObjectId(value)) {
    return <span className="break-all text-sky-300">{value}</span>;
  }
  if (typeof value === 'string') {
    return <span className="wrap-break-word text-amber-300">{JSON.stringify(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-cyan-300">{String(value)}</span>;
  }
  return <span className="text-fuchsia-400">{String(value)}</span>;
}

// `comma` = a sibling follows, so print "," after this value.
// `top` = this is the whole document (only here does `note` get the hint style).
function Value({ value, comma = false, top = false }) {
  const tail = comma ? <Punct>,</Punct> : null;

  if (value !== null && typeof value === 'object') {
    const isArray = Array.isArray(value);
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
    const [open, close] = isArray ? ['[', ']'] : ['{', '}'];

    if (entries.length === 0) {
      return (
        <>
          <Punct>{open}{close}</Punct>
          {tail}
        </>
      );
    }

    return (
      <>
        <Punct>{open}</Punct>
        {entries.map(([key, child], i) => {
          const last = i === entries.length - 1;

          if (top && key === 'note' && typeof child === 'string') {
            return (
              <div
                key={key}
                className="my-1 ml-6 border-l-4 border-green-500 bg-green-500/10 py-1 pl-2"
              >
                <span className="mr-2 border border-green-500 px-1 text-xs uppercase text-green-400">
                  hint
                </span>
                <Key name={key} />
                <Value value={child} comma={!last} />
              </div>
            );
          }

          return (
            <div key={key} className="pl-6">
              {!isArray && <Key name={key} />}
              <Value value={child} comma={!last} />
            </div>
          );
        })}
        <div>
          <Punct>{close}</Punct>
          {tail}
        </div>
      </>
    );
  }

  return (
    <>
      <Scalar value={value} />
      {tail}
    </>
  );
}

export default function BsonView({ document }) {
  return (
    <div role="region" aria-label="Document contents" className="text-sm leading-6">
      <Value value={document} top />
    </div>
  );
}