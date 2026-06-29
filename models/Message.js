import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  read_status: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
