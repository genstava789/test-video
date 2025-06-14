// Get movie ID from config
const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
const contentEntry = contentConfig.recentlyAdded.find(entry => entry.id === currentPage);
const movieId = contentEntry ? contentEntry.tmdbId : null;

// Import utilities from app.js
const { showError, initNavigation, API_KEY, BASE_URL, IMAGE_BASE_URL } = window.movieUtils;

// DOM Elements
const movieBackdrop = document.getElementById('movie-backdrop');
const movieTitle = document.getElementById('movie-title');
const movieYear = document.getElementById('movie-year');
const movieRuntime = document.getElementById('movie-runtime');
const movieRating = document.getElementById('movie-rating');
const movieOverview = document.getElementById('movie-overview');
const movieGenres = document.getElementById('movie-genres');
const movieCast = document.getElementById('movie-cast');
const movieTrailer = document.getElementById('movie-trailer');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    if (movieId) {
        loadMovieDetails();
    } else {
        showError('Movie not found in configuration.');
    }
});

// Load movie details
async function loadMovieDetails() {
    try {
        const [movieDetails, credits, videos] = await Promise.all([
            fetchMovieDetails(),
            fetchMovieCredits(),
            fetchMovieVideos()
        ]);

        renderMovieDetails(movieDetails);
        renderCast(credits.cast);
        renderTrailer(videos.results);

    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Failed to load movie details. Please try again later.');
    }
}

// Fetch movie details from TMDB API
async function fetchMovieDetails() {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

// Fetch movie credits from TMDB API
async function fetchMovieCredits() {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

// Fetch movie videos from TMDB API
async function fetchMovieVideos() {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

// Render movie details
function renderMovieDetails(movie) {
    document.title = `${movie.title} - MovieFlix`;

    // Set backdrop
    if (movie.backdrop_path) {
        movieBackdrop.style.backgroundImage = `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})`;
    }

    // Set text content
    movieTitle.textContent = movie.title;
    movieYear.textContent = new Date(movie.release_date).getFullYear();
    movieRuntime.textContent = `${movie.runtime} min`;
    movieRating.textContent = movie.vote_average.toFixed(1);
    movieOverview.textContent = movie.overview;

    // Set genres
    movieGenres.innerHTML = movie.genres
        .map(genre => `
            <span class="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
                ${genre.name}
            </span>
        `)
        .join('');
}

// Render cast members
function renderCast(cast) {
    const mainCast = cast.slice(0, 6);
    movieCast.innerHTML = mainCast
        .map(person => `
            <div class="flex-shrink-0 w-28 transition-transform hover:-translate-y-1">
                <div class="aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-800 shadow-lg">
                    ${person.profile_path 
                        ? `<img src="${IMAGE_BASE_URL}/w185${person.profile_path}" 
                               alt="${person.name}"
                               class="w-full h-full object-cover transition-opacity opacity-0"
                               onload="this.classList.add('opacity-100')">`
                        : `<div class="w-full h-full flex items-center justify-center">
                               <i class="fas fa-user text-gray-600 text-3xl"></i>
                           </div>`
                    }
                </div>
                <p class="text-sm font-medium truncate">${person.name}</p>
                <p class="text-xs text-gray-400 truncate">${person.character}</p>
            </div>
        `)
        .join('');
}

// Render movie trailer
function renderTrailer(videos) {
    const trailer = videos.find(video => video.type === 'Trailer') || videos[0];
    if (trailer) {
        movieTrailer.innerHTML = `
            <div class="iframely-embed">
                <div class="iframely-responsive">
                    <a href="https://www.youtube.com/watch?v=${trailer.key}"
                       data-iframely-url></a>
                </div>
            </div>
        `;
    }
}
