export async function GET() {
  return new Response("This setup route has been disabled for security reasons.", { status: 403 });
}
