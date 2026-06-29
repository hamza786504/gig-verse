import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'client') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find({ clientId: session.user.id })
      .populate('freelancerId', 'name email profile')
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
    
    if (!session || session.user.role !== 'client') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, action } = body;

    const order = await Order.findOne({ _id: orderId, clientId: session.user.id });
    if (!order) {
      return new Response(JSON.stringify({ message: 'Order not found' }), { status: 404 });
    }

    if (action === 'complete') {
      if (order.status !== 'submitted') {
        return new Response(JSON.stringify({ message: 'Order is not in submitted state' }), { status: 400 });
      }
      order.status = 'completed';
      // Here we would also update freelancer's balance
    }

    await order.save();

    return new Response(JSON.stringify({ message: 'Order updated successfully', order }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update order' }), { status: 500 });
  }
}
