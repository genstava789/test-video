// TMDB API Configuration and Utilities
window.movieUtils = {
    API_KEY: '829a43a98259bc44cae297489c7e3bba',
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    PLACEHOLDER_IMAGE: 'https://via.placeholder.com/500x750?text=No+Image+Available',
    
    showError: function(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000);
        } else {
            console.error(message);
        }
    },

    initNavigation: function() {
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const closeSidebar = document.getElementById('close-sidebar');

        if (hamburger && sidebar && closeSidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.add('active');
            });

            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            });
        }
    },

    fetchMovieById: async function(movieId) {
        try {
            const response = await fetch(`${this.BASE_URL}/movie/${movieId}?api_key=${this.API_KEY}&language=en-US`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie:', error);
            return null;
        }
    }
};

// Check if API key is configured
if (window.movieUtils.API_KEY === 'YOUR_TMDB_API_KEY') {
    window.movieUtils.showError('Please configure your TMDB API key in app.js');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroMovie = document.getElementById('hero-movie');
    const heroTitle = document.getElementById('hero-title');
    const heroOverview = document.getElementById('hero-overview');

    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        initSwipers();
        loadMovies();
    }
});

// Initialize Swiper instances
function initSwipers() {
    const swiperOptions = {
        slidesPerView: 'auto',
        spaceBetween: 16,
        freeMode: {
            enabled: true,
            momentum: true,
            momentumRatio: 0.8
        },
        loop: false,
        mousewheel: false,
        keyboard: false,
        breakpoints: {
            320: {
                spaceBetween: 12
            },
            640: {
                spaceBetween: 16
            },
            1024: {
                spaceBetween: 20
            }
        },
        grabCursor: true,
        touchEventsTarget: 'container',
        cssMode: true
    };

    new Swiper('.recently-added-swiper', swiperOptions);
    new Swiper('.trending-swiper', swiperOptions);
    new Swiper('.popular-swiper', swiperOptions);
}

// Load all movie data
async function loadMovies() {
    try {
        // Load recently added content
        await loadRecentlyAddedContent();

        // Load category content
        const [trendingMovies, popularMovies] = await Promise.all([
            loadCategoryContent('trending'),
            loadCategoryContent('popular')
        ]);

        // Set hero section with first recently added movie
        if (contentConfig.recentlyAdded.length > 0) {
            const heroMovie = await window.movieUtils.fetchMovieById(contentConfig.recentlyAdded[0].tmdbId);
            if (heroMovie) {
                setHeroMovie(heroMovie);
            }
        }

        // Render movie sections
        if (trendingMovies && trendingMovies.length > 0) {
            renderMovies(trendingMovies.filter(movie => movie !== null), '.trending-swiper .swiper-wrapper');
        }
        if (popularMovies && popularMovies.length > 0) {
            renderMovies(popularMovies.filter(movie => movie !== null), '.popular-swiper .swiper-wrapper');
        }

    } catch (error) {
        console.error('Error loading movies:', error);
        window.movieUtils.showError('Failed to load movies. Please try again later.');
    }
}

// Load recently added content
async function loadRecentlyAddedContent() {
    try {
        const recentlyAddedContainer = document.querySelector('.recently-added-swiper .swiper-wrapper');
        if (!recentlyAddedContainer) return;

        // Limit to 10 items
        const recentContent = contentConfig.recentlyAdded.slice(0, 10);
        const moviePromises = recentContent.map(async (content) => {
            const movie = await window.movieUtils.fetchMovieById(content.tmdbId);
            if (movie) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                
                const movieCard = createMovieCard(movie);
                movieCard.addEventListener('click', () => {
                    window.location.href = `content/${content.id}.html`;
                });
                
                slide.appendChild(movieCard);
                recentlyAddedContainer.appendChild(slide);
            }
        });

        await Promise.all(moviePromises);
    } catch (error) {
        console.error('Error loading recently added content:', error);
        window.movieUtils.showError('Failed to load recently added content.');
    }
}

// Load category content
async function loadCategoryContent(category) {
    try {
        if (!contentConfig.categories[category]) return [];
        
        // Limit to 10 movies per category
        const movieIds = contentConfig.categories[category].slice(0, 10);
        const moviePromises = movieIds.map(id => window.movieUtils.fetchMovieById(id));
        const movies = await Promise.all(moviePromises);
        return movies.filter(movie => movie !== null);
    } catch (error) {
        console.error(`Error loading ${category} content:`, error);
        return [];
    }
}

// Set hero section content
function setHeroMovie(movie) {
    const heroMovie = document.getElementById('hero-movie');
    const heroTitle = document.getElementById('hero-title');
    const heroOverview = document.getElementById('hero-overview');

    if (heroMovie && heroTitle && heroOverview && movie.backdrop_path) {
        heroMovie.style.backgroundImage = `url(${window.movieUtils.IMAGE_BASE_URL}/original${movie.backdrop_path})`;
        heroTitle.textContent = movie.title;
        heroOverview.textContent = movie.overview;
    }
}

// Render movies in swiper container
function renderMovies(movies, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    movies.forEach(movie => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const movieCard = createMovieCard(movie);
        slide.appendChild(movieCard);
        container.appendChild(slide);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card group relative w-[160px] sm:w-[180px] lg:w-[200px] h-[240px] sm:h-[270px] lg:h-[300px] rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/30 flex-shrink-0';
    
    const posterUrl = movie.poster_path 
        ? `${window.movieUtils.IMAGE_BASE_URL}/w500${movie.poster_path}` 
        : window.movieUtils.PLACEHOLDER_IMAGE;

    card.innerHTML = `
        <div class="absolute inset-0">
            <img src="${posterUrl}" alt="${movie.title}" 
                 class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 class="text-lg font-bold mb-1 line-clamp-1">${movie.title}</h3>
                    <div class="flex items-center mb-2">
                        <span class="text-yellow-400 text-sm">
                            <i class="fas fa-star"></i>
                        </span>
                        <span class="ml-1 text-sm">${movie.vote_average.toFixed(1)}</span>
                    </div>
                    <button class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium">
                        Watch Now
                    </button>
                </div>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        // Find the content entry for this movie
        const contentEntry = contentConfig.recentlyAdded.find(entry => entry.tmdbId === movie.id.toString());
        if (contentEntry) {
            // Try to fetch the HTML file first
            fetch(`content/${contentEntry.id}.html`)
                .then(response => {
                    if (response.ok) {
                        window.location.href = `content/${contentEntry.id}.html`;
                    } else {
                        // If HTML not found, redirect to TMDB
                        window.location.href = `https://www.themoviedb.org/movie/${movie.id}`;
                    }
                })
                .catch(() => {
                    // If fetch fails, redirect to TMDB
                    window.location.href = `https://www.themoviedb.org/movie/${movie.id}`;
                });
        } else {
            // If not in config, redirect to TMDB
            window.location.href = `https://www.themoviedb.org/movie/${movie.id}`;
        }
    });

    return card;
}

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    } else {
        console.error(message);
    }
}

// Handle fetch errors
async function handleFetch(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
    }
}

// Update fetchMovies to use handleFetch
async function fetchMovies(endpoint) {
    try {
        const data = await handleFetch(endpoint);
        return data.results || [];
    } catch (error) {
        showError(`Failed to load movies from ${endpoint}. Please try again later.`);
        return [];
    }
}
