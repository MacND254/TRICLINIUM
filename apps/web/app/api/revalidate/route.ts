import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const VALID_SECRETS = new Set([
  process.env.INTERNAL_REVALIDATION_SECRET,
  process.env.NEXT_PUBLIC_REVALIDATION_SECRET,
  'triclinium_revalidation_secret_key_8842',
  'triclinium_reval_secret_key',
].filter(Boolean));

function isAuthorized(req: NextRequest, bodySecret?: string): boolean {
  const secret =
    req.headers.get('x-revalidation-secret') ||
    req.nextUrl.searchParams.get('secret') ||
    bodySecret;
  if (!secret) return false;
  return VALID_SECRETS.has(secret);
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  if (!isAuthorized(req, body?.secret)) {
    return NextResponse.json({ success: false, message: 'Invalid revalidation secret' }, { status: 401 });
  }

  try {
    const { path, paths } = body;

    if (paths && Array.isArray(paths)) {
      paths.forEach((p) => revalidatePath(p));
    } else if (path) {
      revalidatePath(path);
    } else {
      revalidatePath('/');
    }

    return NextResponse.json({ success: true, revalidated: true, paths: paths || path || '/', now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: 'Invalid revalidation secret' }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get('path') || '/';
  try {
    revalidatePath(path);
    return NextResponse.json({ success: true, revalidated: true, path, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
