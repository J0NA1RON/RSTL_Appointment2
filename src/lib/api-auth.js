import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Checks for a valid session and (optionally) required role.
 * @param {Request} request - The Next.js API request object.
 * @param {string} [role] - Optional required role (e.g., "admin").
 * @returns {Promise<{session: object|null, error: string|null}>}
 */
export async function requireAuth(request, role) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: "Unauthorized" };
  }
  if (role && session.user?.role !== role) {
    return { session: null, error: "Forbidden" };
  }
  return { session, error: null };
}