export const PUBLIC_PATHS = [
  "/",
  "/welcome",
  "/calculator",
  "/calculator/compound",
  "/calculator/realestate",
  "/calculator/stocks",
  "/sign-in",
  "/sign-up",
]

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => {
    if (p === "/") return pathname === "/"
    return pathname === p || pathname.startsWith(p + "/")
  })
}
