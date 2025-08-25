import { supabase } from './src/utils/supabaseClient';
import { DatabaseService } from './src/lib/database';




async function createAdminUser(email, role) {
  try {
    // First, find the user's Supabase ID using their email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError.message);
      return;
    }

    if (!profiles) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    const userId = profiles.id;

    // Then, update the user's role using the DatabaseService
    const updatedProfile = await DatabaseService.updateUserRole(userId, role);

    console.log(`Successfully updated user ${updatedProfile.email} to role: ${updatedProfile.role}`);
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

const userEmail = process.argv[2];
const newRole = process.argv[3];

if (!userEmail || !newRole) {
  console.log('Usage: node create-admin-user.js <email> <role>');
  process.exit(1);
}

createAdminUser(userEmail, newRole);