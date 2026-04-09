/**
 * Unsplash API integration for Wall Calendar banners
 */

const BANNER_QUERIES = [
  "snow winter landscape",
  "valentine romantic soft",
  "spring blossom aesthetic",
  "rainy nature aesthetic",
  "flower meadow sunny",
  "summer beach sky",
  "fireworks night sky",
  "mountains sunset",
  "autumn leaves forest",
  "halloween dark moon",
  "foggy forest moody",
  "christmas snow cozy"
];

// Simple session-based cache to avoid hitting rate limits
const bannerCache: Record<number, string> = {};

/**
 * Fetches a random landscape image from Unsplash based on the month's theme.
 * Falls back to source.unsplash.com if the API key is missing or call fails.
 */
export async function getUnsplashBanner(month: number): Promise<string> {
  const query = BANNER_QUERIES[month % 12];
  
  // Return from cache if we already fetched it this session
  if (bannerCache[month]) {
    return bannerCache[month];
  }

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("Unsplash Access Key not found. Falling back to source.unsplash.com");
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Unsplash API error: ${res.statusText}`);
    }

    const data = await res.json();
    const url = data.urls.regular;
    
    // Store in cache
    bannerCache[month] = url;
    return url;
  } catch (err) {
    console.error("Failed to fetch Unsplash banner:", err);
    // Fallback to the user's secondary option
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
  }
}
