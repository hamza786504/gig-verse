import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const { canApproveTransactions } = await req.json();

    const manager = await User.findById(params.id);
    if (!manager || manager.role !== 'manager') {
      return new Response(JSON.stringify({ message: 'Manager not found' }), { status: 404 });
    }

    manager.permissions = {
      ...manager.permissions,
      canApproveTransactions: Boolean(canApproveTransactions)
    };

    await manager.save();

    const managerObj = manager.toObject();
    delete managerObj.password;

    return new Response(JSON.stringify({ message: 'Manager updated successfully', manager: managerObj }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update manager' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    await connectDB();
    const manager = await User.findByIdAndDelete(params.id);
    
    if (!manager) {
      return new Response(JSON.stringify({ message: 'Manager not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Manager deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to delete manager' }), { status: 500 });
  }
}
