/**
 * categoryImages.js
 * Maps each product category to a relevant, high-quality Unsplash image URL.
 * Used as the default image when a seller doesn't provide a custom image URL.
 */

export const categoryDefaultImages = {
    'Food & Spices': 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&h=400&fit=crop',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=400&fit=crop',
    'Clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=400&fit=crop',
    'Home & Garden': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop',
    'Jewellery': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=400&fit=crop',
    'Handicrafts': 'https://images.unsplash.com/photo-1509660933844-6910e12765a0?w=600&h=400&fit=crop',
    'Beauty & Wellness': 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&h=400&fit=crop',
    'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    'Books & Stationery': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop',
    'Toys & Kids': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=400&fit=crop',
    'Sports & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    'Raw Materials': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop',
    'Dairy & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop',
    'Grains & Pulses': 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&h=400&fit=crop',
};

/** Returns the category default image URL, or a generic market image as ultimate fallback */
export const getCategoryImage = (category) => {
    if (!category) return 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop';
    
    // Exact match first
    if (categoryDefaultImages[category]) return categoryDefaultImages[category];
    
    // Partial match (case-insensitive)
    const key = Object.keys(categoryDefaultImages).find(
        (k) => k.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(k.toLowerCase())
    );
    
    return key
        ? categoryDefaultImages[key]
        : 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop';
};
