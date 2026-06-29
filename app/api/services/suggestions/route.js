import connectDB from '@/lib/db';
import Service from '@/models/Service';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Find services whose title matches the query
    const suggestions = await Service.find({ 
      title: { $regex: query, $options: 'i' } 
    })
    .select('_id title')
    .limit(5);

    return new Response(JSON.stringify(suggestions), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch suggestions' }), { status: 500 });
  }
}
