import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - public auth routes: /auth/login, /auth/signup, /auth/callback
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/login|auth/signup|auth/callback|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
