'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  
  // Notice the 'await' here - this is crucial for the updated server.ts file to work
  const supabase = await createClient();

  // The redirectTo URL is where the user goes AFTER clicking the email link
  // UPDATED: Sending to the callback route first to create the session cookie, 
  // then passing a parameter to forward them to the update-password page
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://www.rosetasbouquets.com/auth/callback?next=/update-password',
  });

  if (error) {
    console.error('Error sending reset password email:', error.message);
    // Redirect back to the UI with an error parameter
    redirect('/forgot-password?error=Could not send reset link');
  }

  // Redirect back to the UI with a success parameter
  redirect('/forgot-password?message=Check your email for the reset link');
}

// --- NEW CODE ADDED BELOW FOR PHASE 4 ---

// This action is called by your Update Password form to save the new password
export async function updatePassword(formData: FormData) {
  // Extract the new password from the frontend form data
  const password = formData.get('password') as string;
  
  // Await the client creation just like in the request function above
  const supabase = await createClient();

  // Supabase automatically knows which user to update based on the secure session 
  // established when they clicked the link in their email.
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error('Error updating password:', error.message);
    // Redirect back to the form with an error message if the update fails
    redirect('/update-password?error=Could not update password');
  }

  // Success! Redirect them to the login page so they can log in with the new credentials
  redirect('/login?message=Password updated successfully. Please log in.');
}