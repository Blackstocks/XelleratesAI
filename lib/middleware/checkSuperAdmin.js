import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseclient';

export async function middleware(req) {
  const accessToken = req.cookies['sb-access-token'];

  if (!accessToken) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  supabase.auth.setAuth(accessToken);

  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (
    error ||
    !data ||
    data.role !== 'super_admin' ||
    data.status !== 'approved'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*', // Protect the admin dashboard route
};
