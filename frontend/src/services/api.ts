import axios from "axios";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- 1. API CONFIGURATION ---
export const BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5022";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && typeof resData === "object" && resData.success === undefined) {
      resData.success = resData.code ? (resData.code >= 200 && resData.code < 300) : (response.status >= 200 && response.status < 300);
    }
    return resData;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// --- 2. AUTH OPTIONS ---
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }
        try {
          const res: any = await apiClient.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (res?.data?.token && res?.data?.user) {
            return {
              id: res.data.user.id,
              ...res.data.user,
              token: res.data.token,
            };
          }
          throw new Error(res?.message || "Invalid credentials");
        } catch (err: any) {
          throw new Error(err.message || "Login failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, session, user }: any) {
      if (user) {
        token.user = user;
        token.token = user.token;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.user) {
        session.user = token.user;
      }
      if (token?.token) {
        session.token = token.token;
      }
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
export async function getAuthToken() {
  const { getServerSession } = await import("next-auth/next");
  const session: any = await getServerSession(authOptions);
  return session?.token ? `Bearer ${session.token}` : "";
}

export const withAuth = (token: string, config: any = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    Authorization: token,
  },
});
