"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import axios from "axios"

export async function registerUserAction(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const tenantSlug = "default-tenant"
  const roleName = "user"

  if (!fullName || !email || !password) {
    return { success: false, message: "All fields are required." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const registerEndpoint = `${backendUrl}/api/v1/auth/register`

  console.log("Attempting to register user at:", registerEndpoint)

  try {
    const response = await axios.post(
      registerEndpoint,
      {
        fullName,
        email,
        password,
        tenantSlug,
        roleName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    const data = response.data

    if (response.status >= 400) {
      console.error("Backend registration error:", data)
      return { success: false, message: data.message || "Registration failed." }
    }

    console.log("Registration successful, redirecting...")
    redirect("/")
  } catch (error: any) {
    if (error && error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Error during registration:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios response error:", error.response.data)
        return { success: false, message: error.response.data.message || "Registration failed due to server error." }
      } else if (error.request) {
        console.error("Axios request error (no response):", error.request)
        return { success: false, message: "No response from server. Check backend status or network." }
      } else {
        console.error("Axios setup error:", error.message)
        return { success: false, message: error.message || "An unexpected error occurred during request setup." }
      }
    }
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function loginUserAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Email and password are required." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const loginEndpoint = `${backendUrl}/api/v1/auth/login`

  console.log("Attempting to log in user at:", loginEndpoint)

  try {
    const response = await axios.post(
      loginEndpoint,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    const data = response.data.data

    if (response.status >= 400) {
      console.error("Backend login error:", data)
      return { success: false, message: data.message || "Login failed." }
    }

    // Set cookies received from the backend
    if (data.accessToken) {
      cookies().set("accessToken", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60,
        path: "/",
      })
    }
    if (data.refreshToken) {
      cookies().set("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })
    }

    console.log("Login successful, redirecting to dashboard...")
    redirect("/dashboard")
  } catch (error: any) {
    if (error && error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Error during login:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios login response error:", error.response.data)
        return { success: false, message: error.response.data.message || "Login failed due to server error." }
      } else if (error.request) {
        console.error("Axios login request error (no response):", error.request)
        return { success: false, message: "No response from server. Check backend status or network." }
      } else {
        console.error("Axios login setup error:", error.message)
        return { success: false, message: error.message || "An unexpected error occurred during request setup." }
      }
    }
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function logoutUserAction() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const logoutEndpoint = `${backendUrl}/api/v1/auth/logout`

  console.log("Attempting to log out user at:", logoutEndpoint)

  try {
    await axios.post(
      logoutEndpoint,
      {},
      {
        withCredentials: true,
        timeout: 5000,
      },
    )

    cookies().delete("accessToken")
    cookies().delete("refreshToken")

    console.log("Logout successful, redirecting to home page...")
    redirect("/")
  } catch (error: any) {
    if (error && error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Error during logout:", error)
    cookies().delete("accessToken")
    cookies().delete("refreshToken")
    redirect("/")
  }
}

export async function fetchUserProfile() {
  const accessToken = cookies().get("accessToken")?.value

  if (!accessToken) {
    return { success: false, message: "No access token found. User not authenticated." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const profileEndpoint = `${backendUrl}/api/protected/profile`

  console.log("Attempting to fetch user profile at:", profileEndpoint)

  try {
    const response = await axios.get(profileEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 5000,
    })

    const data = response.data

    if (response.status >= 400) {
      console.error("Backend profile fetch error:", data)
      return { success: false, message: data.message || "Failed to fetch user profile." }
    }

    console.log("User profile fetched successfully:", data.user)
    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios profile fetch response error:", error.response.data)
        return {
          success: false,
          message: error.response.data.message || "Failed to fetch user profile due to server error.",
        }
      } else if (error.request) {
        console.error("Axios profile fetch request error (no response):", error.request)
        return { success: false, message: "No response from server. Check backend status or network." }
      } else {
        console.error("Axios profile fetch setup error:", error.message)
        return { success: false, message: error.message || "An unexpected error occurred during request setup." }
      }
    }
    return { success: false, message: "An unexpected error occurred." }
  }
}

// Fetch Tenants Action
export async function fetchTenants() {
  const accessToken = cookies().get("accessToken")?.value

  if (!accessToken) {
    return { success: false, message: "No access token found. User not authenticated.", tenants: [] }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const tenantsEndpoint = `${backendUrl}/api/v1/tenants`

  console.log("Attempting to fetch tenants at:", tenantsEndpoint)

  try {
    const response = await axios.get(tenantsEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 5000,
    })

    const data = response.data // Assuming backend returns { success: true, data: tenantsArray }

    if (response.status >= 400) {
      console.error("Backend fetch tenants error:", data)
      return { success: false, message: data.message || "Failed to fetch tenants.", tenants: [] }
    }

    console.log("Tenants fetched successfully:", data.data)
    return { success: true, tenants: data.data }
  } catch (error: any) {
    console.error("Error fetching tenants:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Axios fetch tenants response error:", error.response.data)
        return {
          success: false,
          message: error.response.data.message || "Failed to fetch tenants due to server error.",
          tenants: [],
        }
      } else if (error.request) {
        console.error("Axios fetch tenants request error (no response):", error.request)
        return { success: false, message: "No response from server. Check backend status or network.", tenants: [] }
      } else {
        console.error("Axios fetch tenants setup error:", error.message)
        return {
          success: false,
          message: error.message || "An unexpected error occurred during request setup.",
          tenants: [],
        }
      }
    }
    return { success: false, message: "An unexpected error occurred.", tenants: [] }
  }
}

// Create Tenant Action
export async function createTenantAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string

  if (!name || !slug) {
    return { success: false, message: "Tenant name and slug are required." }
  }

  const accessToken = cookies().get("accessToken")?.value
  if (!accessToken) {
    return { success: false, message: "You must be logged in to create a tenant." }
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const createTenantEndpoint = `${backendUrl}/api/v1/tenants`

  console.log("Attempting to create tenant at:", createTenantEndpoint)

  try {
    const response = await axios.post(
      createTenantEndpoint,
      { name, slug },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    const data = response.data
    if (response.status >= 400) {
      return { success: false, message: data.message || "Failed to create tenant." }
    }

    return { success: true, message: "Tenant created successfully!", tenant: data.data }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status
        if (status === 403) {
          return { success: false, message: "You don't have permission to create tenants. Please contact an admin." }
        }
        return { success: false, message: error.response.data?.message || "Server error while creating tenant." }
      } else if (error.request) {
        return { success: false, message: "No response from server. Check backend status or network." }
      } else {
        return { success: false, message: error.message || "Unexpected request error." }
      }
    }
    return { success: false, message: "An unexpected error occurred." }
  }
}
