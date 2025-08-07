'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers' // Import cookies from next/headers
import axios from 'axios';

export async function registerUserAction(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const tenantSlug = "default-tenant"
  const roleName = "user"

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
      timeout: 10000,
    });

    const data = response.data;

    if (response.status >= 400) {
      console.error("Backend registration error:", data);
      return { success: false, message: data.message || "Registration failed." }
    }

    console.log("Registration successful, redirecting...");
    redirect('/');

  } catch (error: any) {
    if (error && error.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
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

export async function loginUserAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: "Email and password are required." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const loginEndpoint = `${backendUrl}/api/v1/auth/login`;

  console.log("Attempting to log in user at:", loginEndpoint);

  try {
    const response = await axios.post(loginEndpoint, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const data = response.data.data; // Backend ApiResponse wraps data in a 'data' field

    if (response.status >= 400) {
      console.error("Backend login error:", data);
      return { success: false, message: data.message || "Login failed." }
    }

    // Set cookies received from the backend
    // Assuming your backend sends accessToken and refreshToken in the response body
    // If your backend sets them as HTTP-only cookies directly, you might not need this.
    // However, if it sends them in the JSON response, this is how you'd set them.
    if (data.accessToken) {
      cookies().set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });
    }
    if (data.refreshToken) {
      cookies().set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    console.log("Login successful, redirecting to dashboard...");
    redirect('/dashboard'); // Redirect to a dashboard page after login

  } catch (error: any) {
    if (error && error.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error during login:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios login response error:", error.response.data);
        return { success: false, message: error.response.data.message || "Login failed due to server error." };
      } else if (error.request) {
        console.error("Axios login request error (no response):", error.request);
        return { success: false, message: "No response from server. Check backend status or network." };
      } else {
        console.error("Axios login setup error:", error.message);
        return { success: false, message: error.message || "An unexpected error occurred during request setup." };
      }
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}
