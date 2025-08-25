import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, role } = body || {};

    if ((!id && !email) || !role) {
      return NextResponse.json({ error: 'Provide user id or email, and role' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let userId = id as string | undefined;

    if (!userId && email) {
      const { data: profileByEmail, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 404 });
      }

      userId = profileByEmail?.id;

      if (!userId) {
        return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId as string)
      .select('id, email, role')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Role updated`, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}