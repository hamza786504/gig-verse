import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const fromDateStr = searchParams.get('from');
    const toDateStr = searchParams.get('to');

    let query = {};

    if (fromDateStr || toDateStr) {
      query['timeline.created_at'] = {};
      if (fromDateStr) {
        // Start of the day
        const from = new Date(fromDateStr);
        from.setUTCHours(0, 0, 0, 0);
        query['timeline.created_at'].$gte = from;
      }
      if (toDateStr) {
        // End of the day
        const to = new Date(toDateStr);
        to.setUTCHours(23, 59, 59, 999);
        query['timeline.created_at'].$lte = to;
      }
    }

    const orders = await Order.find(query)
      .populate('clientId', 'name email')
      .populate('serviceId', 'title')
      .sort({ 'timeline.created_at': -1 }) // Newest first
      .limit(50); // Limit to 50 for performance

    return new Response(JSON.stringify(orders), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch orders' }), { status: 500 });
  }
}
