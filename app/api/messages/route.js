import connectDB from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Pusher from 'pusher';

// Initialize Pusher only if credentials are provided
let pusher = null;
if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    await connectDB();
    
    let filter = {};
    
    // Admins and Managers can see all messages for a specific order
    if (session.user.role === 'admin' || session.user.role === 'manager') {
      if (orderId) {
        filter.orderId = orderId;
      } else {
        // Prevent managers from seeing global messages without context
        return new Response(JSON.stringify([]), { status: 200 });
      }
    } else {
      // Regular users only see their own messages
      filter.$or = [{ senderId: session.user.id }, { receiverId: session.user.id }];
      if (orderId) {
        filter.orderId = orderId;
      }
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'name profile.avatar')
      .populate('receiverId', 'name profile.avatar')
      .sort({ createdAt: 1 });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch messages' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    await connectDB();
    const body = await req.json();
    const { receiverId, text, attachmentUrl, orderId } = body;

    const newMessage = new Message({
      senderId: session.user.id,
      receiverId,
      orderId,
      text,
      attachmentUrl
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'name profile.avatar');

    // Trigger Pusher event if configured
    if (pusher) {
      const channel = `chat-${orderId || receiverId}`;
      await pusher.trigger(channel, 'new-message', newMessage);
    }

    return new Response(JSON.stringify(newMessage), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to send message' }), { status: 500 });
  }
}
