import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidation-secret') || req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.INTERNAL_REVALIDATION_SECRET || 'triclinium_reval_secret_key';

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ success: false, message: 'Invalid revalidation secret' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { path, paths } = body;

    if (paths && Array.isArray(paths)) {
      paths.forEach((p) => revalidatePath(p));
    } else if (path) {
      revalidatePath(path);
    } else {
      revalidatePath('/');
    }

    return NextResponse.json({ success: true, revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
