'use server'

import { redirect } from 'next/navigation'
import axios from 'axios';

export async function registerUserAction(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Hardcode default tenant and role for the free tier
  const tenantSlug = "default-tenant" // Ensure this tenant exists in your backend
  const roleName = "user" // Ensure this role exists in your backend

  if (!fullName || !email || !password) {
    return { success: false, message: "All fields are required." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const registerEndpoint = `${backendUrl}/api/v1/auth/register`;

  console.log("Attempting to register user at:", registerEndpoint);

  try {
    const response = await axios.post(registerEndpoint, {
      fullName,
      email,
      password,
      tenantSlug,
      roleName
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // Add a timeout for axios (10 seconds)
    });

    const data = response.data;

    if (response.status >= 400) {
      console.error("Backend registration error:", data);
      return { success: false, message: data.message || "Registration failed." }
    }

    console.log("Registration successful, redirecting...");
    redirect('/'); // This throws the NEXT_REDIRECT error

  } catch (error: any) {
    // --- NEW: Check if the error is a Next.js redirect error ---
    if (error && error.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw the redirect error so Next.js can handle it
    }
    // --- END NEW ---

    console.error("Error during registration:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios response error:", error.response.data);
        return { success: false, message: error.response.data.message || "Registration failed due to server error." };
      } else if (error.request) {
        console.error("Axios request error (no response):", error.request);
        return { success: false, message: "No response from server. Check backend status or network." };
      } else {
        console.error("Axios setup error:", error.message);
        return { success: false, message: error.message || "An unexpected error occurred during request setup." };
      }
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}
