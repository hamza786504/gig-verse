import connectDB from '@/lib/db';
import Service from '@/models/Service';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const service = await Service.findById(id).populate('freelancerId', 'name email profile');

    if (!service) {
      return new Response(JSON.stringify({ message: 'Service not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(service), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch service' }), { status: 500 });
  }
}
