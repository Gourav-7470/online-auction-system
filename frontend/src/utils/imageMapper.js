// Curated high-resolution imagery for auction products based on title/category keywords

const CATEGORY_IMAGES = {
  watches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80',
  ],
  art: [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1000&q=80',
  ],
  vehicles: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
  ],
  collectibles: [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
  ],
};

export const AUCTION_CATEGORIES = [
  'All',
  'Watches & Luxury',
  'Electronics & Tech',
  'Art & Paintings',
  'Vehicles & Motors',
  'Jewelry & Gems',
  'Collectibles & Antiques',
  'Cameras & Optics',
  'Furniture & Decor',
];

const PHOTOS_STORAGE_KEY_PREFIX = 'bidzone_auction_photos_';

/**
 * Validates that 2 or more product photos are provided (compulsory for selling)
 * @param {string[]} photos - Array of photo URLs or base64 data URLs
 * @returns {{ isValid: boolean, count: number, remaining: number, message: string }}
 */
export function validateProductPhotos(photos) {
  const count = Array.isArray(photos) ? photos.length : 0;
  const remaining = Math.max(0, 2 - count);

  if (count === 0) {
    return {
      isValid: false,
      count: 0,
      remaining: 2,
      message: 'Product photos are compulsory: You must upload or add at least 2 photos to sell this product.',
    };
  }

  if (count < 2) {
    return {
      isValid: false,
      count,
      remaining,
      message: `Only 1 photo provided. At least 2 product photos are compulsory to sell this product (please add ${remaining} more).`,
    };
  }

  return {
    isValid: true,
    count,
    remaining: 0,
    message: `Compulsory requirement met (${count} photos provided).`,
  };
}

/**
 * Returns a pack of curated high-resolution sample photos matching a product category
 * @param {string} category
 * @returns {string[]}
 */
export function getCategorySamplePhotos(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('watch') || cat.includes('luxury')) return [...CATEGORY_IMAGES.watches];
  if (cat.includes('tech') || cat.includes('electron')) return [...CATEGORY_IMAGES.electronics];
  if (cat.includes('art') || cat.includes('paint')) return [...CATEGORY_IMAGES.art];
  if (cat.includes('vehic') || cat.includes('motor')) return [...CATEGORY_IMAGES.vehicles];
  if (cat.includes('jewel') || cat.includes('gem')) return [...CATEGORY_IMAGES.jewelry];
  if (cat.includes('camera') || cat.includes('optic')) return [...CATEGORY_IMAGES.cameras];
  if (cat.includes('furnit') || cat.includes('decor')) return [...CATEGORY_IMAGES.furniture];
  if (cat.includes('collect') || cat.includes('antique')) return [...CATEGORY_IMAGES.collectibles];
  return [...CATEGORY_IMAGES.default];
}

/**
 * Persists an array of product photos for an auction to localStorage
 * @param {string|number} auctionId
 * @param {string[]} photos
 */
export function saveAuctionPhotos(auctionId, photos) {
  if (!auctionId || !Array.isArray(photos) || photos.length === 0) return;
  try {
    localStorage.setItem(`${PHOTOS_STORAGE_KEY_PREFIX}${auctionId}`, JSON.stringify(photos));
  } catch (err) {
    console.warn('Unable to persist auction photos to localStorage:', err);
  }
}

/**
 * Returns all photo URLs associated with an auction
 * @param {object} auction
 * @returns {string[]}
 */
export function getAuctionPhotos(auction) {
  if (!auction) return CATEGORY_IMAGES.default;

  // 1. Check if user previously saved custom photos in localStorage for this auction ID
  if (auction.id) {
    try {
      const stored = localStorage.getItem(`${PHOTOS_STORAGE_KEY_PREFIX}${auction.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  // 2. Check if object has photos or images array
  if (Array.isArray(auction.photos) && auction.photos.length > 0) {
    return auction.photos;
  }
  if (Array.isArray(auction.images) && auction.images.length > 0) {
    return auction.images;
  }

  // 3. If single imageUrl is provided
  if (auction.imageUrl) {
    return [auction.imageUrl];
  }

  // 4. Default to matching category photo collection (which provides 2-3 curated photos)
  const text = `${auction.title || ''} ${auction.description || ''} ${auction.category || ''}`.toLowerCase();
  if (text.includes('watch') || text.includes('rolex') || text.includes('omega') || text.includes('timepiece')) {
    return CATEGORY_IMAGES.watches;
  }
  if (text.includes('macbook') || text.includes('laptop') || text.includes('phone') || text.includes('headphone') || text.includes('audio') || text.includes('console') || text.includes('tech')) {
    return CATEGORY_IMAGES.electronics;
  }
  if (text.includes('art') || text.includes('painting') || text.includes('sculpture') || text.includes('canvas')) {
    return CATEGORY_IMAGES.art;
  }
  if (text.includes('car') || text.includes('motor') || text.includes('porsche') || text.includes('bike') || text.includes('vehicle')) {
    return CATEGORY_IMAGES.vehicles;
  }
  if (text.includes('diamond') || text.includes('gold') || text.includes('ring') || text.includes('necklace') || text.includes('jewel')) {
    return CATEGORY_IMAGES.jewelry;
  }
  if (text.includes('camera') || text.includes('lens') || text.includes('canon') || text.includes('nikon') || text.includes('sony')) {
    return CATEGORY_IMAGES.cameras;
  }
  if (text.includes('chair') || text.includes('table') || text.includes('sofa') || text.includes('furniture')) {
    return CATEGORY_IMAGES.furniture;
  }
  if (text.includes('card') || text.includes('coin') || text.includes('comic') || text.includes('vintage') || text.includes('antique')) {
    return CATEGORY_IMAGES.collectibles;
  }

  return CATEGORY_IMAGES.default;
}

/**
 * Returns a high-res image URL tailored to the auction title or category (primary cover photo)
 * @param {object} auction
 * @returns {string}
 */
export function getAuctionImage(auction) {
  const photos = getAuctionPhotos(auction);
  return photos && photos.length > 0 ? photos[0] : CATEGORY_IMAGES.default[0];
}
