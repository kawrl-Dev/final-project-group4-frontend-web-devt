import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // What the player typed, kept for display ("Alice")
  username: { type: String, required: true, trim: true },
  // Lowercase copy ("alice"). The unique index here makes usernames
  // case-insensitive: "ALICE" collides with "alice".
  usernameLower: { type: String, required: true, unique: true },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
