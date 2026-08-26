import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

export async function middleware(request: NextRequest) {
  // Browser ki cookies se 'auth_token' nikalne ki koshish karein
  const token = request.cookies.get('auth_token')?.value;

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // SCENARIO 1: Agar user bina token ke Dashboard par jana chahe
  if (isDashboardPage) {
    if (!token) {
      // Wapas login page par bhej do
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Token verify karein ke fake ya expired toh nahi?
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next(); // Pass hone dein
    } catch (error) {
      // Token galat hai, wapas bhej do
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // SCENARIO 2: Agar user already logged in hai aur login page par wapas jaye
  if (isLoginPage && token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      // Puraane login walo ko seedha dashboard bhej do
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Config batata hai ke yeh guard kin routes par khara hoga
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};