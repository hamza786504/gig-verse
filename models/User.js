import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'manager', 'admin'], default: 'client' },
  permissions: {
    canApproveTransactions: { type: Boolean, default: false }
  },
  profile: {
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    skills: [{ type: String }],
    hourly_rate: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews_count: { type: Number, default: 0 },
    level: { type: String, enum: ['New User', 'Level 1', 'Level 2', 'Top Rated'], default: 'New User' }
  },
  balance: { type: Number, default: 0 }, // For freelancers
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
