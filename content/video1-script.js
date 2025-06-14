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
                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="185" height="278" viewBox="0 0 185 278" fill="none"%3E%3Crect width="185" height="278" fill="%231F2937"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236B7280" font-family="system-ui" font-size="14px"%3ENo Image%3C/text%3E%3C/svg%3E';

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

function initShareableLinks() {
  const contentUrlInput = document.getElementById('share-content-url');
  const iframeCodeTextarea = document.getElementById('share-iframe-code');
  const copyContentBtn = document.getElementById('copy-content-btn');
  const copyIframeBtn = document.getElementById('copy-iframe-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  if (!contentUrlInput || !iframeCodeTextarea || !copyContentBtn || !copyIframeBtn) {
    console.error('Shareable link elements not found on the page.');
    return;
  }

  // Set the Content URL to the current page URL
  const contentUrl = window.location.href;
  contentUrlInput.value = contentUrl;

  // Create an embeddable iframe snippet
  const iframeCode = `<iframe src="${contentUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
  iframeCodeTextarea.value = iframeCode;

  // Helper function to copy text and show feedback
  const copyText = async (textToCopy, button) => {
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (!icon) return;
    
    const originalClass = icon.className;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Show success feedback
      icon.className = 'fas fa-check text-green-500';
      
      // Revert back to copy icon after delay
      setTimeout(() => {
        icon.className = originalClass;
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      
      // Show error feedback
      icon.className = 'fas fa-times text-red-500';
      setTimeout(() => {
        icon.className = originalClass;
      }, 1500);
    }
  };

  // Handle copy content button click
  function handleCopyContent(event) {
    const contentUrlInput = document.getElementById('share-content-url');
    if (contentUrlInput) {
      copyText(contentUrlInput.value, event.currentTarget);
    }
  }

  // Handle copy iframe button click
  function handleCopyIframe(event) {
    const iframeCodeTextarea = document.getElementById('share-iframe-code');
    if (iframeCodeTextarea) {
      copyText(iframeCodeTextarea.value, event.currentTarget);
    }
  }

  // Initialize social share buttons
  const socialButtons = {
    facebook: () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`, '_blank');
    },
    twitter: () => {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(contentUrl)}`, '_blank');
    },
    whatsapp: () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(contentUrl)}`, '_blank');
    }
  };

  // Add click handlers for social share buttons
  document.querySelectorAll('#share-section button[title^="Share on"]').forEach(button => {
    const platform = button.title.replace('Share on ', '').toLowerCase();
    if (socialButtons[platform]) {
      button.addEventListener('click', socialButtons[platform]);
    }
  });

  copyContentBtn.addEventListener('click', handleCopyContent);
  copyIframeBtn.addEventListener('click', handleCopyIframe);
}

// Cleanup function to remove event listeners
function cleanup() {
  const copyContentBtn = document.getElementById('copy-content-btn');
  const copyIframeBtn = document.getElementById('copy-iframe-btn');
  if (copyContentBtn) {
    copyContentBtn.removeEventListener('click', handleCopyContent);
  }
  if (copyIframeBtn) {
    copyIframeBtn.removeEventListener('click', handleCopyIframe);
  }
}

// Helper function to copy text and show feedback
async function copyText(text) {
  const copyFeedback = document.getElementById('copy-feedback');
  try {
    await navigator.clipboard.writeText(text);
    
    // Show feedback toast
    copyFeedback.style.transform = 'translateY(0)';
    copyFeedback.style.opacity = 1;
    
    // Hide feedback after delay
    setTimeout(() => {
      copyFeedback.style.transform = 'translateY(100%)';
      copyFeedback.style.opacity = 0;
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    if (window.movieUtils && typeof window.movieUtils.showError === 'function') {
      window.movieUtils.showError('Failed to copy text. Please try again.');
    } else {
      alert('Failed to copy text. Please try again.');
    }
  }
}

// Handle copy content button click
function handleCopyContent() {
  const contentUrlInput = document.getElementById('share-content-url');
  if (contentUrlInput) {
    copyText(contentUrlInput.value);
  }
}

// Handle copy iframe button click
function handleCopyIframe() {
  const iframeCodeTextarea = document.getElementById('share-iframe-code');
  if (iframeCodeTextarea) {
    copyText(iframeCodeTextarea.value);
  }
}

// Load movie details when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    loadMovieDetails();
    initShareableLinks();
  } catch (error) {
    console.error('Error initializing page:', error);
    if (window.movieUtils && typeof window.movieUtils.showError === 'function') {
      window.movieUtils.showError('Failed to initialize page. Please refresh.');
    }
  }
});

// Cleanup event listeners when page unloads
window.addEventListener('unload', cleanup);
