import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['order_update', 'new_message', 'payment_approved', 'general'], required: true },
  content: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  link: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
