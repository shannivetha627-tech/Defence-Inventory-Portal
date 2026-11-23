// Stable product image mapping based on item code and name
// Consistent across renders and user sessions

export const productImages = {
    // Electronics
    ITM001: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80", // Laptop
    ITM002: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80", // Printer
    ITM003: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80", // Keyboard
    ITM004: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80", // Desktop Monitor
    ITM005: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80", // Mouse
    ITM006: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80", // Keyboard Cover
    ITM007: "/products/usb-cable.jpg", // USB Cable
    ITM008: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80", // HDMI Cable
    ITM009: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80", // Power Adapter
    ITM010: "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=600&q=80", // Extension Board

    // Workshop Tools
    ITM011: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=600&q=80", // Tool Kit
    ITM012: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80", // Screwdriver Set
    ITM013: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80", // Adjustable Wrench
    ITM014: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80", // Pliers

    // Safety Supplies
    ITM015: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80", // Safety Gloves
    ITM016: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=600&q=80", // Safety Goggles
    ITM017: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80", // Safety Helmet
    ITM018: "https://images.unsplash.com/photo-1586942593568-29361efcd571?auto=format&fit=crop&w=600&q=80", // Protective Mask
    ITM019: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80", // First Aid Kit

    // Maintenance & Office
    ITM020: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80", // Cleaning Kit
    ITM021: "https://images.unsplash.com/photo-1563968743333-044cef800494?auto=format&fit=crop&w=600&q=80", // Printer Toner
    ITM022: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80", // Printer Paper
    ITM023: "https://images.unsplash.com/photo-1585336261026-78b1cf6c3e74?auto=format&fit=crop&w=600&q=80", // Stapler

    // Storage
    ITM024: "/products/usb-drive.jpg", // USB Drive
    ITM025: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=600&q=80"  // External Hard Drive
};

export const categoryFallbackImages = {
    Electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    Accessories: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    "Workshop Tools": "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=600&q=80",
    "Safety Supplies": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80",
    "Office Supplies": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
    Storage: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
    Electrical: "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=600&q=80",
    Maintenance: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80"
};

export const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80";

export const getProductImage = (item) => {
    if (!item) return DEFAULT_PRODUCT_IMAGE;

    // Direct match by item code
    if (item.code && productImages[item.code]) {
        return productImages[item.code];
    }

    // Fallback by category
    if (item.category && categoryFallbackImages[item.category]) {
        return categoryFallbackImages[item.category];
    }

    return DEFAULT_PRODUCT_IMAGE;
};
