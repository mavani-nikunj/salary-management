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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const email = credentials?.email || credentials?.userId;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }

        try {
          const endpoint = `${BASE_URL || "http://localhost:5022"}/api/auth/login`;
          const res = await axios.post(endpoint, {
            email: email.trim().toLowerCase(),
            password,
          });

          const data = res.data?.data;
          if (data && data.token && data.user) {
            return {
              id: String(data.user.id || data.user._id),
              name:
                data.user.name ||
                `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
                data.user.email,
              email: data.user.email,
              role: data.user.role,
              orgId: String(data.user.orgId),
              token: data.token,
              user: data.user,
            };
          }

          throw new Error(
            res.data?.message || "Invalid authentication response from server",
          );
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Invalid credentials. Please verify your email and password.";
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = (user as any).user;
        token.role = (user as any).role;
        token.orgId = (user as any).orgId;
        token.accessToken = (user as any).token;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = token.user || session.user;
        session.role = token.role;
        session.orgId = token.orgId;
        session.token = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
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
