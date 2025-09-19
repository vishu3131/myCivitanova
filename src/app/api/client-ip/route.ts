import { NextResponse } from 'next/server';

/**
 * GET /api/client-ip
 * Simple utility to get client IP address
 */
export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    let ip = 'unknown';
    
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    } else {
      // Fallback to connection remote address (may not be available in all environments)
      const connInfo = (request as any).socket?.remoteAddress;
      if (connInfo) {
        ip = connInfo;
      }
    }

    return NextResponse.json({ ip });
  } catch (error) {
    console.error('Error getting client IP:', error);
    return NextResponse.json({ ip: 'unknown' });
  }
}