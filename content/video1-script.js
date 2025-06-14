// Initialize navigation
window.movieUtils.initNavigation();

// Movie data from TMDB API
const movieId = '1097311'; // "No Hard Feelings"

// Fetch and display movie details
async function loadMovieDetails() {
    try {
        const movie = await window.movieUtils.fetchMovieById(movieId);
        if (!movie) throw new Error('Failed to fetch movie details');

        // Set backdrop
        const backdropPath = movie.backdrop_path;
        if (backdropPath) {
            document.getElementById('movie-backdrop').style.backgroundImage = 
                `url(${window.movieUtils.IMAGE_BASE_URL}/original${backdropPath})`;
        }

        // Set title and meta info
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-year').textContent = new Date(movie.release_date).getFullYear();
        document.getElementById('movie-runtime').textContent = `${movie.runtime} min`;
        document.getElementById('movie-rating').textContent = movie.vote_average.toFixed(1);
        document.getElementById('movie-overview').textContent = movie.overview;

        // Set genres
        const genresContainer = document.getElementById('movie-genres');
        movie.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'px-3 py-1 bg-gray-800 text-gray-300 text-xs sm:text-sm rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-colors duration-300';
            genreTag.textContent = genre.name;
            genresContainer.appendChild(genreTag);
        });

        // Fetch and display cast
        const credits = await fetch(
            `${window.movieUtils.BASE_URL}/movie/${movieId}/credits?api_key=${window.movieUtils.API_KEY}`
        ).then(res => res.json());

        const castContainer = document.getElementById('movie-cast');
        credits.cast.slice(0, 10).forEach(actor => {
            const actorCard = document.createElement('div');
            actorCard.className = 'flex-shrink-0 w-[120px] sm:w-[140px]';
            
            const profilePath = actor.profile_path
                ? `${window.movieUtils.IMAGE_BASE_URL}/w185${actor.profile_path}`
                : 'https://via.placeholder.com/185x278?text=No+Image';

            actorCard.innerHTML = `
                <div class="aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-800">
                    <img src="${profilePath}" alt="${actor.name}"
                         class="w-full h-full object-cover">
                </div>
                <h4 class="font-medium text-sm sm:text-base line-clamp-1">${actor.name}</h4>
                <p class="text-xs sm:text-sm text-gray-400 line-clamp-1">${actor.character}</p>
            `;
            
            castContainer.appendChild(actorCard);
        });

        // Fetch and display trailer
        const videos = await fetch(
            `${window.movieUtils.BASE_URL}/movie/${movieId}/videos?api_key=${window.movieUtils.API_KEY}`
        ).then(res => res.json());

        const trailer = videos.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (trailer) {
            const trailerContainer = document.getElementById('movie-trailer');
            trailerContainer.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${trailer.key}?rel=0"
                    class="w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        }

    } catch (error) {
        console.error('Error:', error);
        window.movieUtils.showError('Failed to load movie details');
    }
}

// Load movie details when DOM is ready
document.addEventListener('DOMContentLoaded', loadMovieDetails);
