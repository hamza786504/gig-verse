import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    
    // Fetch user to get current permissions
    const user = await User.findById(session.user.id);

    // Fetch orders pending approval
    const orders = await Order.find({ status: 'pending_approval' })
      .populate('clientId', 'name email')
      .populate('serviceId', 'title')
      .sort({ createdAt: 1 });

    const canApprove = user?.permissions?.canApproveTransactions || false;

    return new Response(JSON.stringify({ orders, canApprove }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch pending orders' }), { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, action } = body;

    const order = await Order.findById(orderId).populate('serviceId');
    if (!order) {
      return new Response(JSON.stringify({ message: 'Order not found' }), { status: 404 });
    }

    const user = await User.findById(session.user.id);
    const canApprove = user?.permissions?.canApproveTransactions || false;

    if (!canApprove && (action === 'approve' || action === 'reject')) {
      return new Response(JSON.stringify({ message: 'You do not have permission to approve or reject transactions.' }), { status: 403 });
    }

    if (action === 'approve') {
      order.status = 'in_progress';
      order.timeline.started_at = new Date();
      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + order.serviceId.delivery_time_days);
      order.timeline.deadline = deadline;
    } else if (action === 'reject') {
      order.status = 'disputed'; // Or 'payment_failed'
    }

    await order.save();

    return new Response(JSON.stringify({ message: `Order ${action}d successfully`, order }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update order' }), { status: 500 });
  }
}
