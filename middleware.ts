import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// POR ESTE MOMENTO, TODAS LAS RUTAS SON PÚBLICAS.
// El usuario puede entrar a cualquier página sin iniciar sesión.
// Si en el futuro quieres reactivar el login, simplemente elimina esta función o cambia el matcher.
const isPublicRoute = createRouteMatcher([".*"])

export default clerkMiddleware(async (auth, request) => {
  // No forzamos login: isPublicRoute siempre devuelve true.
  // El usuario entra directamente a cualquier página.
  // Si descomenta la línea de abajo, se reactiva el control de acceso:
  // await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}