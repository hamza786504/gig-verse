import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();

    const [clients, freelancers, managers, activeOrders] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'manager' }),
      Order.countDocuments({ status: 'in_progress' })
    ]);

    return new Response(JSON.stringify({ 
      clients, 
      freelancers, 
      managers, 
      activeOrders 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch statistics' }), { status: 500 });
  }
}
