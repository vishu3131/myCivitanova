import { DatabaseService } from '@/lib/database.ts';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient.ts';

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Authenticate with Supabase admin client if necessary, or ensure RLS is handled
    // For this example, we'll assume the DatabaseService handles authentication/permissions

    // First, find the user's Supabase ID using their email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError.message);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profiles) {
      return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
    }

    const userId = profiles.id;

    // Then, update the user's role using the DatabaseService
    const updatedProfile = await DatabaseService.updateUserRole(userId, role);

    return NextResponse.json({ message: `Successfully updated user ${updatedProfile.email} to role: ${updatedProfile.role}` });
  } catch (error: any) {
    console.error('An unexpected error occurred:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}