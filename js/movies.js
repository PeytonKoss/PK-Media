let allMovies = [];
let currentObserver = null;
let currentFilter = 'title';
let isAscending = true;

function populateMoviesContent(data, searchQuery = '', attempts = 0, maxAttempts = 50) {
    const container = document.getElementById('movies-content');
    if (!container) {
        if (attempts < maxAttempts) {
            setTimeout(() => populateMoviesContent(data, searchQuery, attempts + 1, maxAttempts), 100);
        }
        return;
    }

    if (!allMovies.length) {
        allMovies = data.movies;
    }

    const query = searchQuery.toLowerCase();
    let filteredMovies = query
        ? allMovies.filter(movie => movie.title.toLowerCase().includes(query))
        : allMovies;

    filteredMovies = filteredMovies.slice().sort((a, b) => {
        let comparison = 0;
        if (currentFilter === 'title') {
            comparison = a.title.localeCompare(b.title);
        } else if (currentFilter === 'size') {
            const sizeA = parseSize(a.sizeHuman);
            const sizeB = parseSize(b.sizeHuman);
            comparison = sizeA - sizeB;
        } else if (currentFilter === 'date') {
            comparison = (a.year || 0) - (b.year || 0);
        }
        return isAscending ? comparison : -comparison;
    });

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.classList.add('movie-grid');
    container.appendChild(grid);

    if (currentObserver) {
        currentObserver.disconnect();
    }

    currentObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const placeholder = entry.target;
                const movie = JSON.parse(placeholder.dataset.movie);

                const card = document.createElement('div');
                card.classList.add('movie-card');
                card.innerHTML = `
                    <img loading="lazy" src="assets/images/movie_image/${movie.ratingKey}.thumb.webp" alt="${movie.title}">
                    <div class="movie-year">(${movie.year})</div>
                    <div class="movie-details">
                        <h3>${movie.title}</h3>
                        <p>Rated: ${movie.contentRating}</p>
                        <p>${movie.durationHuman}</p>
                        <p>${movie.videoResolution}</p>
                        <p>Codec: ${movie.videoCodec}</p>
                        <p>Audio: ${movie.audioCodec}</p>
                        <p>File Type: ${movie.container}</p>
                        <p>(${movie.sizeHuman})</p>
                    </div>
                `;

                placeholder.replaceWith(card);
                observer.unobserve(placeholder);
            }
        });
    }, {
        root: null,
        rootMargin: '200px',
        threshold: 0
    });

    filteredMovies.forEach(movie => {
        const placeholder = document.createElement('div');
        placeholder.classList.add('movie-card-placeholder');
        placeholder.style.height = '262.5px';
        placeholder.dataset.movie = JSON.stringify(movie);
        grid.appendChild(placeholder);
        currentObserver.observe(placeholder);
    });
}

function parseSize(sizeHuman) {
    if (!sizeHuman) return 0;
    const [value, unit] = sizeHuman.split(' ');
    const numValue = parseFloat(value) || 0;
    if (unit === 'GB') return numValue * 1024;
    if (unit === 'TB') return numValue * 1024 * 1024;
    return numValue;
}

function initializeFilterAndSort() {
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer) {
        setTimeout(initializeFilterAndSort, 100);
        return;
    }

    const searchInput = document.getElementById('movie-search');
    if (!searchInput) return;

    const searchRow = document.createElement('div');
    searchRow.className = 'search-row';
    searchRow.style.display = 'flex';
    searchRow.style.alignItems = 'center';
    searchRow.style.gap = '8px';
    searchRow.style.flexWrap = 'wrap';

    const searchInputContainer = document.createElement('div');
    searchInputContainer.className = 'search-input-container';
    searchInputContainer.style.display = 'flex';
    searchInputContainer.style.justifyContent = 'center';
    searchInputContainer.style.width = '100%';

    const filterButtonsDiv = document.createElement('div');
    filterButtonsDiv.className = 'filter-buttons';
    filterButtonsDiv.style.display = 'flex';
    filterButtonsDiv.style.gap = '5px';

    const filters = [
        { name: 'Title', value: 'title', icon: '📝' },
        { name: 'Size', value: 'size', icon: '💾' },
        { name: 'Date', value: 'date', icon: '📅' }
    ];

    filters.forEach(filter => {
        const btn = document.createElement('button');
        btn.dataset.filter = filter.value;
        btn.title = filter.name;
        btn.className = 'filter-btn';
        btn.style.width = '36px';
        btn.style.height = '36px';
        btn.style.display = 'flex';
        btn.style.zIndex = '1000';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = filter.value === currentFilter ? '#d4a04f' : '#1a1a1a';
        btn.style.color = filter.value === currentFilter ? '#fff' : '#ccc';
        btn.style.fontSize = '18px';
        btn.style.transition = 'background-color 0.3s, color 0.3s';
        btn.style.borderRadius = '4px';
        btn.textContent = filter.icon;
        filterButtonsDiv.appendChild(btn);
    });

    const sortOrderContainer = document.createElement('div');
    sortOrderContainer.className = 'sort-order-container';
    sortOrderContainer.style.display = 'flex';

    const sortOrderBtn = document.createElement('button');
    sortOrderBtn.id = 'sort-order-btn';
    sortOrderBtn.className = 'sort-order-btn';
    sortOrderBtn.style.width = '36px';
    sortOrderBtn.style.height = '36px';
    sortOrderBtn.style.backgroundColor = '#d4a04f';
    sortOrderBtn.style.border = 'none';
    sortOrderBtn.style.borderRadius = '4px';
    sortOrderBtn.style.cursor = 'pointer';
    sortOrderBtn.style.transition = 'transform 0.3s';
    updateSortButtonIcon(sortOrderBtn);
    sortOrderContainer.appendChild(sortOrderBtn);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.alignItems = 'center';
    buttonsContainer.style.gap = '8px';
    buttonsContainer.appendChild(filterButtonsDiv);
    buttonsContainer.appendChild(sortOrderContainer);

    searchInputContainer.appendChild(searchInput);
    searchRow.appendChild(searchInputContainer);
    searchRow.appendChild(buttonsContainer);

    const existingSearchRow = searchContainer.querySelector('.search-row');
    if (existingSearchRow) {
        existingSearchRow.replaceWith(searchRow);
    } else {
        searchContainer.appendChild(searchRow);
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            filterButtons.forEach(btn => {
                btn.style.backgroundColor = '#1a1a1a';
                btn.style.color = '#ccc';
            });
            button.style.backgroundColor = '#d4a04f';
            button.style.color = '#fff';
            isAscending = true;
            updateSortButtonIcon(sortOrderBtn);
            populateMoviesContent(window.moviesData, searchInput.value);
        });
    });

    sortOrderBtn.addEventListener('click', () => {
        isAscending = !isAscending;
        updateSortButtonIcon(sortOrderBtn);
        populateMoviesContent(window.moviesData, searchInput.value);
    });
}

function updateSortButtonIcon(sortOrderBtn) {
    sortOrderBtn.style.transform = isAscending ? 'scaleY(1)' : 'scaleY(-1)';
    sortOrderBtn.title = isAscending ? 'Sort Ascending' : 'Sort Descending';
}

document.addEventListener('refDataLoaded', (event) => {
    populateMoviesContent(event.detail);
    initializeFilterAndSort();
});

document.addEventListener("DOMContentLoaded", () => {
    const moviesCard = document.querySelector(".movies-card");

    if (moviesCard) {
        moviesCard.addEventListener("click", (event) => {
            event.preventDefault();
        });
    }
    initializeFilterAndSort();
});

document.addEventListener("refDataLoaded", (event) => {
    const data = event.detail.metadata;

    const totalMovies = document.getElementById("movies-total");
    const totalSize = document.getElementById("movies-size");
    if (totalMovies && totalSize) {
        totalMovies.textContent = `${data.totalMovies} Movies`;
        totalSize.textContent = `(${data.totalSizeHuman})`;
        totalMovies.classList.add("data-loaded");
        totalSize.classList.add("data-loaded");
    }
});

document.addEventListener("refDataLoaded", (event) => {
    const data = event.detail;
    const searchInput = document.getElementById("movie-search");

    let debounceTimeout;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const query = searchInput.value.toLowerCase();
            populateMoviesContent(data, query);
        }, 300);
    });
});

function scrollToTop(scrollTarget) {
    scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
}

function findScrollableElement() {
    const mainContent = document.getElementById('main-content');
    const moviesContent = document.getElementById('movies-content');
    if (mainContent && mainContent.scrollHeight > mainContent.clientHeight) {
        return mainContent;
    } else if (moviesContent && moviesContent.scrollHeight > moviesContent.clientHeight) {
        return moviesContent;
    }
    return window;
}

function initializeScroll(attempts = 0, maxAttempts = 50) {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    let scrollTarget = findScrollableElement();

    if (!scrollToTopBtn) {
        if (attempts < maxAttempts) {
            setTimeout(() => initializeScroll(attempts + 1, maxAttempts), 100);
        }
    }

    const checkScroll = () => {
        const searchContainer = document.querySelector('.search-container');
        const scrollPosition = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;

        const searchContainerBottom = searchContainer.getBoundingClientRect().bottom;

        if (searchContainerBottom < 0 || scrollPosition > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    };

    scrollTarget.addEventListener('scroll', checkScroll);
    scrollToTopBtn.addEventListener('click', () => scrollToTop(scrollTarget));
    checkScroll();

    const observer = new MutationObserver(() => {
        const newScrollTarget = findScrollableElement();
        if (newScrollTarget !== scrollTarget) {
            scrollTarget.removeEventListener('scroll', checkScroll);
            scrollTarget = newScrollTarget;
            scrollTarget.addEventListener('scroll', checkScroll);
        }
    });
    observer.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true });
}

initializeScroll();

function initializeInfoIcons() {
    const cards = document.querySelectorAll('.index-card');
    if (!cards.length) {
        setTimeout(initializeInfoIcons, 100);
        return;
    }

    cards.forEach((card) => {
        const infoIcon = card.querySelector('.info-icon');

        infoIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            card.classList.toggle('hover-enabled');
            card.classList.toggle('hover-scale');
            infoIcon.classList.add('hidden');

            cards.forEach((otherCard) => {
                if (otherCard !== card) {
                    otherCard.classList.remove('hover-enabled');
                    otherCard.classList.remove('hover-scale');
                    const otherIcon = otherCard.querySelector('.info-icon');
                    if (otherIcon) otherIcon.classList.remove('hidden');
                }
            });
        });
    });

    document.addEventListener('click', () => {
        cards.forEach((card) => {
            card.classList.remove('hover-enabled');
            card.classList.remove('hover-scale');
            const icon = card.querySelector('.info-icon');
            if (icon) icon.classList.remove('hidden');
        });
    });
}

initializeInfoIcons();

function initializeRecommendationFeature() {
    const fab = document.getElementById('recommend-fab');
    if (!fab) {
        console.error('FAB element with id "recommend-fab" not found in the HTML.');
        return;
    }

    fab.addEventListener('click', () => {
        window.open('https://overseerr.pkcollection.net', '_blank');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    initializeRecommendationFeature();
    initializeInfoIcons();
    initializeScroll();
});

document.addEventListener('pageContentLoaded', () => {
    console.log('pageContentLoaded fired');
    initializeRecommendationFeature();
});

setTimeout(() => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Fallback: Running initializeRecommendationFeature');
        initializeRecommendationFeature();
        initializeInfoIcons();
        initializeScroll();
    }
}, 1000);