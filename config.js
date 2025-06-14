// Content Configuration
const contentConfig = {
    // Recently Added Content (newest first)
    recentlyAdded: [
        {
            id: "video1",
            tmdbId: "1097311",  // Example: "No Hard Feelings"
            category: "trending"
        },
        {
            id: "video2",
            tmdbId: "447365",   // Example: "Guardians of the Galaxy Vol. 3"
            category: "popular"
        },
        {
            id: "video3",
            tmdbId: "569094",   // Example: "Spider-Man: Across the Spider-Verse"
            category: "trending"
        },
        {
            id: "video4",
            tmdbId: "298618",   // Example: "The Flash"
            category: "popular"
        }
    ],

    // Category specific content
    categories: {
        trending: [
            "1097311",  // No Hard Feelings
            "569094",   // Spider-Man: Across the Spider-Verse
            "385687",   // Fast X
            "346698"    // Barbie
        ],
        popular: [
            "447365",   // Guardians of the Galaxy Vol. 3
            "298618",   // The Flash
            "667538",   // Transformers: Rise of the Beasts
            "976573"    // Elemental
        ]
    }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = contentConfig;
} else {
    window.contentConfig = contentConfig;
}
