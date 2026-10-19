// Renders a BSON-style document as colored, indented JSON-like text.
// Green keys, amber values, dim green punctuation. Built from <span>/<div>
// elements, so no dangerouslySetInnerHTML and no regex on strings.

function Punct({ children }) {
  return <span className="text-green-600">{children}</span>;
}

// `comma` = this value is followed by a sibling, so print a "," after it.
function Value({ value, comma = false }) {
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
        {entries.map(([key, child], i) => (
          <div key={key} className="pl-6">
            {/* Array items have no key, only objects print "key": */}
            {!isArray && (
              <>
                <span className="text-green-400">"{key}"</span>
                <Punct>: </Punct>
              </>
            )}
            <Value value={child} comma={i < entries.length - 1} />
          </div>
        ))}
        <div>
          <Punct>{close}</Punct>
          {tail}
        </div>
      </>
    );
  }

  // string, number, boolean, null
  return (
    <>
      <span className="wrap-break-word text-amber-400">{JSON.stringify(value)}</span>
      {tail}
    </>
  );
}

export default function DocumentViewer({ document }) {
  return (
    <div className="text-sm leading-6" aria-label="Document contents" role="region">
      <Value value={document} />
    </div>
  );
}
