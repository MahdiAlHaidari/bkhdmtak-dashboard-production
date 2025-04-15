// API Base URLs
export const API_BASE_URL = "https://prod-backend.bkhdmtak.app"

export const IMAGE_BASE_URL = "https://prod-bk-v2.s3.eu-north-1.amazonaws.com/Media/"
export const MEDIA_PATH = "Media/"

// Helper function to construct image URLs
export function getImageUrl(path: string | null | undefined, isUserImage = false): string {
  if (!path) {
    // Return default user avatar for user images
    if (isUserImage) {
      return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/person-9MNxkxRFh15nnv2pvalYwqUd8fj0DJ.png"
    }
    // Return placeholder for non-user images
    return "/placeholder.svg?height=200&width=200"
  }
  return `${IMAGE_BASE_URL}${path}`
}
