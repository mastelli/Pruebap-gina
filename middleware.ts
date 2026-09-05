import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Rutas que NO requieren autenticación (públicas) - solo estas
const isPublicRoute = createRouteMatcher([
  "/",                       // inicio (raíz)
  "/welcome",                // pantalla de bienvenida
  "/calculator",             // calculadora
  "/calculator/compound",    // interés compuesto
  "/calculator/realestate",  // activos inmobiliarios
  "/calculator/stocks",      // acciones
  "/calculator/bonds",       // bonos
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}