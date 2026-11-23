// Stable product image mapping

export const productImages = {
  ITM001: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  ITM002: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80",
  ITM003: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  ITM004: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
  ITM005: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
  ITM006: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",

  // LOCAL PRODUCT IMAGES
  ITM007: "/products/usb-cable.jpg",
  ITM010: "/products/extension-board.jpg",
  ITM013: "/products/adjustable-wrench.jpg",
  ITM016: "/products/safety-goggles.jpg",
  ITM017: "/products/safety-helmet.jpg",

  ITM008: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80",
  ITM009: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",

  ITM011: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=600&q=80",
  ITM012: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80",
  ITM014: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80",

  ITM015: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  ITM018: "https://images.unsplash.com/photo-1586942593568-29361efcd571?auto=format&fit=crop&w=600&q=80",
  ITM019: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80",

  ITM020: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
  ITM021: "https://images.unsplash.com/photo-1563968743333-044cef800494?auto=format&fit=crop&w=600&q=80",
  ITM022: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",

  // LOCAL PRODUCT IMAGE
  ITM023: "/products/stapler.jpg",

  // LOCAL PRODUCT IMAGE
  ITM024: "/products/usb-drive.jpg",

  ITM025: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=600&q=80"
};

export const categoryFallbackImages = {
  Electronics: "/products/usb-drive.jpg",
  Accessories: "/products/usb-cable.jpg",
  "Workshop Tools": "/products/adjustable-wrench.jpg",
  "Safety Supplies": "/products/safety-helmet.jpg",
  "Office Supplies": "/products/stapler.jpg",
  Storage: "/products/usb-drive.jpg",
  Electrical: "/products/extension-board.jpg",
  Maintenance: "/products/stapler.jpg"
};

export const DEFAULT_PRODUCT_IMAGE = "/products/usb-drive.jpg";

export const getProductImage = (item) => {
  if (!item) return DEFAULT_PRODUCT_IMAGE;

  if (item.code && productImages[item.code]) {
    return productImages[item.code];
  }

  if (item.category && categoryFallbackImages[item.category]) {
    return categoryFallbackImages[item.category];
  }

  return DEFAULT_PRODUCT_IMAGE;
};