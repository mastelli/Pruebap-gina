import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Por este tiempo desactivamos el requisito de login en TODAS las rutas.
// Si en el futuro se quiere proteger de nuevo, solo hay que quitar el comentario a auth.protect().
const isPublicRoute = createRouteMatcher([".*"])

export default clerkMiddleware(async (auth, request) => {
  // No forzamos login: isPublicRoute siempre devuelve true.
  // Si descomenta la línea de abajo, se reactiva el control de acceso.
  // await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}