import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    await connectDB();
    
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch notifications' }), { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    await connectDB();
    
    // Mark all as read
    await Notification.updateMany(
      { userId: session.user.id, is_read: false },
      { $set: { is_read: true } }
    );

    return new Response(JSON.stringify({ message: 'Notifications marked as read' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update notifications' }), { status: 500 });
  }
}
