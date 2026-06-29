import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending_payment', 'pending_approval', 'in_progress', 'submitted', 'completed', 'disputed'],
    default: 'pending_approval' 
  },
  payment: {
    transaction_id: { type: String },
    amount: { type: Number, required: true }
  },
  timeline: {
    created_at: { type: Date, default: Date.now },
    started_at: { type: Date },
    submitted_at: { type: Date },
    deadline: { type: Date }
  },
  work_attachments: [{ type: String }], // URLs of submitted work
  client_notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
