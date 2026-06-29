import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'client') {
      return new Response(JSON.stringify({ message: 'Unauthorized. Only clients can place orders.' }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { serviceId, transaction_id, client_notes } = body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return new Response(JSON.stringify({ message: 'Service not found' }), { status: 404 });
    }

    const newOrder = new Order({
      serviceId: service._id,
      clientId: session.user.id,
      freelancerId: service.freelancerId,
      status: 'pending_approval',
      payment: {
        transaction_id,
        amount: service.price
      },
      client_notes
    });

    await newOrder.save();
    
    return new Response(JSON.stringify({ message: 'Order placed successfully. Pending manager approval.', orderId: newOrder._id }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to place order' }), { status: 500 });
  }
}
