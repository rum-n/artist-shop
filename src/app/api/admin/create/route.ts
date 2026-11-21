import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';

const API_SECRET = process.env.API_SECRET;

/*
 * Creating an account is gated on API_SECRET, which is never returned by this
 * route — there is deliberately no GET handler. Once the artist's admin user
 * exists, this route can be deleted outright.
 */
export async function POST(request: NextRequest) {
  try {
    // Without a configured secret there is no way to authorise the caller, and
    // comparing against `Bearer undefined` would let anyone through.
    if (!API_SECRET) {
      console.error('API_SECRET is not configured; refusing to create users.');
      return NextResponse.json({ message: 'Not available' }, { status: 503 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Never logged: the body carries a plaintext password.
    const { email, name, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name: name || '',
        password: hashedPassword,
        role: role || 'admin',
      },
    });

    // Only non-sensitive fields: the full record includes the password hash.
    return NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
}
