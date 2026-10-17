// 3-20 characters: letters, numbers, underscore
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

// Returns an error message string, or null if the username is valid
export function validateUsername(username) {
  if (typeof username !== 'string') return 'Username is required';
  const name = username.trim();
  if (name.length < 3) return 'Username must be at least 3 characters';
  if (name.length > 20) return 'Username must be at most 20 characters';
  if (!USERNAME_REGEX.test(name)) {
    return 'Username can only contain letters, numbers and underscores';
  }
  return null;
}
