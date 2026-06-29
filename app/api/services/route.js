import connectDB from '@/lib/db';
import Service from '@/models/Service';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const level = searchParams.get('level');
    
    let filter = {};
    
    // Text search
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { skills_tags: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Level filter
    if (level) {
      // Find users matching the level
      const usersWithLevel = await User.find({ 'profile.level': level }).select('_id');
      const userIds = usersWithLevel.map(u => u._id);
      filter.freelancerId = { $in: userIds };
    }

    const services = await Service.find(filter)
      .populate('freelancerId', 'name profile.avatar profile.rating profile.level')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(services), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch services' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'freelancer') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    
    const newService = new Service({
      ...body,
      freelancerId: session.user.id
    });

    await newService.save();
    
    return new Response(JSON.stringify(newService), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to create service' }), { status: 500 });
  }
}
