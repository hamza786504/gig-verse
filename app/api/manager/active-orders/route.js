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
    
    // Fetch orders that are currently in progress
    const orders = await Order.find({ status: 'in_progress' })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('serviceId', 'title')
      .sort({ 'timeline.started_at': -1 });

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch active orders' }), { status: 500 });
  }
}
