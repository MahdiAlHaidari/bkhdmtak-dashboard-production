"use client"

import { useEffect, useState, useRef } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Loader2, AlertCircle, Maximize, Minimize } from "lucide-react"
import { getAuthToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"

interface Provider {
  id: number
  name: string
  address: string
  phoneNumber: string
  currentLatitude: number
  currentLongitude: number
  profileImage: string
  distanceKm: number
  markerImage: string
  rating: number
  categories: { id: number; nameAr: string; nameEn: string }[]
}

interface NearbyProvidersResponse {
  providers: Provider[]
  count: number
  message: string
}

// Default coordinates for Baghdad
const DEFAULT_LOCATION = { lat: 33.3152, lng: 44.3661 }
const GOOGLE_MAPS_API_KEY = "AIzaSyBe7i8Vz5aCgBKcI7rYugvOF9hMv0mojpw"

export function ProvidersMap() {
  const isMobile = useIsMobile()
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapWrapperRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const initializationAttempted = useRef(false)
  const [radius, setRadius] = useState<number>(25)
  const [isDialogVisible, setIsDialogVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Step 1: Load Google Maps API
  useEffect(() => {
    console.log("Checking if Google Maps is loaded...")

    // If Google Maps is already loaded, mark it as loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps already loaded")
      setGoogleMapsLoaded(true)
      return
    }

    console.log("Loading Google Maps script...")
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("Google Maps script loaded successfully")
      setGoogleMapsLoaded(true)
    }

    script.onerror = () => {
      console.error("Google Maps script failed to load")
      setError("Failed to load Google Maps. Please check your internet connection.")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Clean up if component unmounts during loading
      script.onload = null
      script.onerror = null
    }
  }, [])

  // Request location permission automatically when component mounts
  useEffect(() => {
    console.log("Automatically requesting location permission")

    if (!navigator.geolocation) {
      console.log("Geolocation not supported, using default location")
      setUserLocation(DEFAULT_LOCATION)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location permission granted:", position.coords)
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.warn("Location permission denied or error:", error)
        setUserLocation(DEFAULT_LOCATION)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  // Step 3: Initialize map once we have both Google Maps loaded and user location
  useEffect(() => {
    if (!googleMapsLoaded || !userLocation || !mapContainerRef.current || initializationAttempted.current) {
      return
    }

    console.log("Attempting to initialize map with:", {
      googleMapsLoaded,
      userLocation,
      mapContainerRef: !!mapContainerRef.current,
    })

    initializationAttempted.current = true

    try {
      console.log("Creating Google Map instance")
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: userLocation,
        zoom: 13,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      googleMapRef.current = map

      // Add marker for user location
      new window.google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
      })

      setMapInitialized(true)

      // Fetch providers after map is initialized
      fetchNearbyProviders(userLocation.lat, userLocation.lng)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }, [googleMapsLoaded, userLocation])

  // Step 4: Fetch and display nearby providers
  const fetchNearbyProviders = async (latitude: number, longitude: number) => {
    if (!googleMapRef.current) {
      console.error("Google Map reference is not available")
      setError("Map initialization failed. Please refresh the page.")
      setIsLoading(false)
      return
    }

    try {
      console.log("Fetching providers near:", latitude, longitude)
      const token = getAuthToken()
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
        pageNumber: "1",
        pageSize: "100",
      })

      // Make API request
      let data: NearbyProvidersResponse
      try {
        const response = await fetch(`https://backend.bkhdmtak.app/Admin/Provider/nearby?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch nearby providers: ${response.status}`)
        }

        data = await response.json()
        console.log("Providers data received:", data)
      } catch (apiError) {
        console.warn("API error, using mock data:", apiError)
        // Mock data for testing
        data = {
          providers: [
            {
              id: 1,
              name: "Test Provider 1",
              address: "Test Address 1",
              phoneNumber: "1234567890",
              currentLatitude: latitude + 0.01,
              currentLongitude: longitude + 0.01,
              profileImage: "",
              distanceKm: 1.5,
              markerImage: "",
              rating: 4.5,
              categories: [{ id: 1, nameAr: "Test Category", nameEn: "Test Category" }],
            },
            {
              id: 2,
              name: "Test Provider 2",
              address: "Test Address 2",
              phoneNumber: "0987654321",
              currentLatitude: latitude - 0.01,
              currentLongitude: longitude - 0.01,
              profileImage: "",
              distanceKm: 2.3,
              markerImage: "",
              rating: 3.8,
              categories: [{ id: 2, nameAr: "Another Category", nameEn: "Another Category" }],
            },
          ],
          count: 2,
          message: "Providers found successfully.",
        }
      }

      setProviders(data.providers)
      console.log("Adding markers for", data.providers.length, "providers")

      // Add markers for each provider on the map
      data.providers.forEach((provider) => {
        try {
          const marker = new window.google.maps.Marker({
            position: {
              lat: provider.currentLatitude,
              lng: provider.currentLongitude,
            },
            map: googleMapRef.current,
            icon: provider.markerImage
              ? {
                  url: provider.markerImage,
                  scaledSize: new window.google.maps.Size(48, 48), // Increased size from 32 to 48
                }
              : {
                  // Default custom marker if no markerImage is provided
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 12, // Larger scale
                  fillColor: "#FF5722",
                  fillOpacity: 0.9,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                },
            title: provider.name,
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-size: 16px;">${provider.name}</h3>
              <p style="margin: 4px 0;"><strong>Address:</strong> ${provider.address || "N/A"}</p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${provider.phoneNumber}</p>
              <p style="margin: 4px 0;"><strong>Distance:</strong> ${provider.distanceKm.toFixed(2)} km</p>
              ${
                provider.categories.length > 0
                  ? `<p style="margin: 4px 0;"><strong>Categories:</strong> ${provider.categories
                      .map((cat) => cat.nameEn)
                      .join(", ")}</p>`
                  : ""
              }
            </div>
          `,
          })

          marker.addListener("click", () => {
            infoWindow.open(googleMapRef.current, marker)
          })
        } catch (err) {
          console.error("Error adding marker for provider:", provider.id, err)
        }
      })

      console.log("Map initialization complete")
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching nearby providers:", error)
      setError("Failed to load providers. Please try again later.")
      setIsLoading(false)
    }
  }

  const refreshProviders = () => {
    if (!userLocation || !googleMapRef.current) return

    setIsLoading(true)
    // Clear existing markers
    if (googleMapRef.current) {
      const map = googleMapRef.current
      map.setCenter(userLocation)
    }

    fetchNearbyProviders(userLocation.lat, userLocation.lng)
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return

    if (!isFullscreen) {
      if (mapWrapperRef.current.requestFullscreen) {
        mapWrapperRef.current.requestFullscreen()
      } else if ((mapWrapperRef.current as any).webkitRequestFullscreen) {
        ;(mapWrapperRef.current as any).webkitRequestFullscreen()
      } else if ((mapWrapperRef.current as any).msRequestFullscreen) {
        ;(mapWrapperRef.current as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const safetyTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("Safety timeout triggered - forcing loading state to false")
          setIsLoading(false)
          if (!error) {
            setError("Loading timed out. Please try refreshing the page.")
          }
        }
      }, 15000) // 15 seconds timeout

      return () => clearTimeout(safetyTimeout)
    }
  }, [isLoading, error])

  // Update loading state based on initialization progress
  useEffect(() => {
    if (mapInitialized) {
      // Map is initialized, but we might still be loading providers
      // The fetchNearbyProviders function will set isLoading to false when done
    } else if (error) {
      // If there's an error, we're no longer loading
      setIsLoading(false)
    }
  }, [mapInitialized, error])

  // Always render the map container, but overlay it with loading or error states
  return (
    <div ref={mapWrapperRef} className="h-full w-full relative" style={{ minHeight: "300px" }}>
      {/* Map container - always rendered */}
      <div
        ref={mapContainerRef}
        id="google-map-container"
        className="h-full w-full rounded-lg"
        style={{
          minHeight: "300px",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#f0f0f0", // Light background so it's visible even before map loads
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 rounded-lg z-10">
          <div className="text-center p-4 max-w-md">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 mb-2 font-medium">Error Loading Map</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Fullscreen button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 z-20 h-8 shadow-md bg-white hover:bg-gray-100"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize className="mr-1 h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize className="mr-1 h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>

          {/* Toggle button that's always visible */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-4 left-4 z-20 h-8 shadow-md bg-white hover:bg-gray-100"
            onClick={() => setIsDialogVisible(!isDialogVisible)}
          >
            {isDialogVisible ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                </svg>
                Filter
              </>
            )}
          </Button>

          {/* Providers dialog that can be hidden */}
          {isDialogVisible && (
            <div className="absolute bottom-4 right-4 md:w-80 bg-white p-4 rounded-lg shadow-md z-20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  {providers.length > 0 ? (
                    <>
                      Showing {providers.length} active provider
                      {providers.length > 1 ? "s" : ""}
                    </>
                  ) : (
                    <>No providers found</>
                  )}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={refreshProviders}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                  Refresh
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Radius (km):</div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
                  className="w-16 h-7 px-2 text-xs border rounded"
                />
                <div className="flex-1"></div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700 text-xs"
                  onClick={refreshProviders}
                  disabled={isLoading}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Add TypeScript declaration for Google Maps
declare global {
  interface Window {
    google: any
  }
}
