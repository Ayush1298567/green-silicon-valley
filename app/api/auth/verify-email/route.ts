import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (!token || type !== 'signup') {
    return NextResponse.redirect(new URL('/portal?error=invalid-link', request.url));
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup',
    });

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.redirect(new URL('/portal?error=verification-failed', request.url));
    }

    // Verification successful
    return NextResponse.redirect(new URL('/portal?success=email-verified', request.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/portal?error=verification-failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('Resend verification error:', error);
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
