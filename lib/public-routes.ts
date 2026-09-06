export const PUBLIC_PATHS = [
  "/",
  "/welcome",
  "/calculator",
  "/calculator/compound",
  "/calculator/realestate",
  "/calculator/stocks",
  "/privacidad",
  "/terminos",
  "/cookies",
  "/aviso-legal",
  "/help",
  "/sign-in",
  "/sign-up",
]

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => {
    if (p === "/") return pathname === "/"
    return pathname === p || pathname.startsWith(p + "/")
  })
}
