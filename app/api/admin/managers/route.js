import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const managers = await User.find({ role: 'manager' }).select('-password').sort({ name: 1 });
    
    return new Response(JSON.stringify(managers), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch managers' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const { name, email, password, canApproveTransactions } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User with this email already exists' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = new User({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      permissions: { canApproveTransactions: Boolean(canApproveTransactions) }
    });

    await newManager.save();
    
    const managerObj = newManager.toObject();
    delete managerObj.password;

    return new Response(JSON.stringify({ message: 'Manager created successfully', manager: managerObj }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to create manager' }), { status: 500 });
  }
}
