import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'freelancer') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find({ freelancerId: session.user.id })
      .populate('clientId', 'name email profile')
      .populate('serviceId', 'title price')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch orders' }), { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'freelancer') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, action, workUrl } = body;

    const order = await Order.findOne({ _id: orderId, freelancerId: session.user.id });
    if (!order) {
      return new Response(JSON.stringify({ message: 'Order not found' }), { status: 404 });
    }

    if (action === 'submit_work') {
      if (order.status !== 'in_progress') {
        return new Response(JSON.stringify({ message: 'Order is not in progress' }), { status: 400 });
      }
      order.status = 'submitted';
      order.timeline.submitted_at = new Date();
      if (workUrl) {
        order.work_attachments.push(workUrl);
      }
    }

    await order.save();

    return new Response(JSON.stringify({ message: 'Work submitted successfully', order }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update order' }), { status: 500 });
  }
}
