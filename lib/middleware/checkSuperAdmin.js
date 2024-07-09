import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseclient';

export async function middleware(req) {
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
  matcher: '/dashboard/admin/:path*', // Protect the admin dashboard route
};
