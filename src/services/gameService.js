// Game data layer. Everything here is MOCK data held in memory.
// Replace the function bodies with fetch calls when the backend is ready.
// The screen code only imports getItem and solve.

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// The full maze. "lock.answer" must NEVER leave this file.
const MAZE = [
  { slug: 'root', name: 'C:', type: 'folder', parent: null },
  { slug: 'users', name: 'users', type: 'folder', parent: 'root' },
  { slug: 'users_guest', name: 'guest.bson', type: 'file', parent: 'users',
    document: { _id: "ObjectId('65f1a0c1')", username: 'guest', status: 'locked',
      note: 'Welcome to the Start. Every document has fields. Each field has a key and a value.' } },
  { slug: 'logs', name: 'logs', type: 'folder', parent: 'root',
    lock: { prompt: 'Password: the value of status in guest.bson', hint: 'Open users and read guest.bson.', answer: 'locked' } },
  { slug: 'logs_entry_01', name: 'entry_01.bson', type: 'file', parent: 'logs',
    document: { _id: "ObjectId('65f1a0c2')", user: 'm.oliva', action: 'deleted',
      ref: { collection: 'vault', key: 'door' },
      note: 'A ref points to another document. This one points to a key inside the vault.' } },
  { slug: 'logs_entry_02', name: 'entry_02.bson', type: 'file', parent: 'logs',
    document: { _id: "ObjectId('65f1a0c3')", user: 'm.oliva', action: 'encrypted', codes: [2, 5, 9],
      note: 'The square brackets mean an array. The last code opens the way.' } },
  { slug: 'vault', name: 'vault', type: 'folder', parent: 'root',
    lock: { prompt: 'Password: the value of key inside ref in entry_01.bson', hint: 'ref is a smaller document inside the file.', answer: 'door' } },
  { slug: 'vault_door', name: 'door.bson', type: 'file', parent: 'vault',
    lock: { prompt: 'Password: the last number in codes in entry_02.bson', hint: 'Read the list from left to right.', answer: '9' },
    document: { _id: "ObjectId('65f1a0c5')", type: 'door', locked: true,
      owner: { name: 'Minos', role: 'keeper' },
      note: 'Documents can hold other documents. The owner of this door is named inside owner.' } },
  { slug: 'vault_ledger', name: 'ledger.bson', type: 'file', parent: 'vault',
    lock: { prompt: 'Password: the name of the owner in door.bson', hint: 'Look inside the curly braces after owner.', answer: 'Minos' },
    document: { _id: "ObjectId('65f1a0c6')",
      accounts: [
        { _id: 'acc_1', owner: 'cabanting', verified: true },
        { _id: 'acc_2', owner: 'oliva', verified: true },
        { _id: 'acc_3', owner: 'unknown' } ],
      note: 'Documents in the same list should look alike. One account is missing a field.' } },
  { slug: 'archive', name: 'archive', type: 'folder', parent: 'root' },
  { slug: 'archive_old', name: 'old.bson', type: 'file', parent: 'archive',
    document: { _id: "ObjectId('65f1a0c4')", type: 'backup', deprecated: true, note: 'Nothing useful here.' } },
  { slug: 'core', name: 'core', type: 'folder', parent: 'root',
    lock: { prompt: 'Password: the _id of the account with no verified field in ledger.bson', hint: "Two accounts have verified. Find the one that doesn't.", answer: 'acc_3' } },
  { slug: 'core_truth', name: 'truth.bson', type: 'file', parent: 'core', isFinal: true,
    document: { _id: "ObjectId('65f1a0c7')", type: 'truth', message: 'Yay you got to the ending. Placeholder text btw.' } },
];

// Reply for an item that is open (no lock info at all).
function unlockedReply(item) {
  const base = { slug: item.slug, name: item.name, type: item.type, isFinal: !!item.isFinal, locked: false };
  if (item.type === 'folder') {
    const children = MAZE.filter((m) => m.parent === item.slug).map((m) => ({
      slug: m.slug, name: m.name, type: m.type, locked: !!m.lock,
    }));
    return { ...base, children };
  }
  return { ...base, document: item.document };
}

/** getItem(slug): locked items return ONLY the locked shape. */
export async function getItem(slug) {
  await delay();
  const item = MAZE.find((m) => m.slug === slug);
  if (!item) throw new Error(`Item ${slug} not found`);
  if (item.lock) {
    return {
      slug: item.slug, name: item.name, type: item.type, locked: true,
      lock: { prompt: item.lock.prompt, hint: item.lock.hint }, // no answer!
    };
  }
  return unlockedReply(item);
}

/** solve(slug, answer): trims and ignores upper/lower case. */
export async function solve(slug, answer) {
  await delay();
  const item = MAZE.find((m) => m.slug === slug);
  if (!item || !item.lock) throw new Error(`Item ${slug} has no lock`);
  const ok = String(answer).trim().toLowerCase() === item.lock.answer.toLowerCase();
  return ok ? { correct: true, item: unlockedReply(item) } : { correct: false };
}
