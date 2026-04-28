import { timingSafeEqual } from 'crypto';

export type ErrorCode =
  | 'auth_required'
  | 'validation_error'
  | 'not_found'
  | 'slug_conflict'
  | 'server_error';

export function errorResponse(
  status: number,
  message: string,
  code: ErrorCode,
  extra?: Record<string, unknown>
): Response {
  return new Response(JSON.stringify({ error: message, code, ...(extra ?? {}) }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = new Uint8Array(Buffer.from(a));
  const bb = new Uint8Array(Buffer.from(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Returns null if authorized, or a 401 Response if not.
// Accepts the key via Authorization: Bearer <key>.
export function requireAuth(request: Request): Response | null {
  const expected = import.meta.env.BLOG_API_KEY as string | undefined;
  if (!expected) {
    return errorResponse(500, 'API key is not configured', 'server_error');
  }

  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match || !constantTimeEqual(match[1], expected)) {
    return errorResponse(401, 'authentication required', 'auth_required');
  }
  return null;
}
