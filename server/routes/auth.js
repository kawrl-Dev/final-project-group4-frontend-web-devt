import { Router } from 'express';
import User from '../models/User.js';
import { validateUsername } from '../utils/validateUsername.js';
import { signToken } from '../utils/token.js';

const router = Router();

// POST /api/auth/register  { username }  ->  201 { token, user }
router.post('/register', async (req, res) => {
  const { username } = req.body ?? {};

  const problem = validateUsername(username);
  if (problem) return res.status(400).json({ error: problem });

  const name = username.trim();

  try {
    const user = await User.create({
      username: name,
      usernameLower: name.toLowerCase(),
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    // 11000 = MongoDB "duplicate key": the unique index rejected the name
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    throw err; // Express 5 forwards this to the error handler (500)
  }
});

export default router;
