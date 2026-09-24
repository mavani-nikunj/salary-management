import axios from "axios";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- 1. API CONFIGURATION ---
export const BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

// --- 2. AUTH OPTIONS ---
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "Email / Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        return credentials;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, session, user }) {
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 86400 },
  pages: { signIn: "/", error: "/" },
};

// --- 3. INTERNAL HELPERS ---
/**
 * Utility to get the current user's session token securely on the server.
 */
export async function getAuthToken() {
  const { getServerSession } = await import("next-auth/next");
  const session: any = await getServerSession(authOptions);
  return session?.token ? `Bearer ${session.token}` : "";
}

/**
 * Utility to merge Authorization header with other axios config.
 */
export const withAuth = (token: string, config: any = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    Authorization: token,
  },
});
