import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  delivery_time_days: { type: Number, required: true },
  skills_tags: [{ type: String }],
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
