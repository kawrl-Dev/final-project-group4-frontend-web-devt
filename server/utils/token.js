import jwt from 'jsonwebtoken';

// The token holds ONLY the user id. The role is always read from the
// database later, so nobody can fake being an admin.
export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}
