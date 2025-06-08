function levenshteinDistance(a, b) {
    const m = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
                ? m[i - 1][j - 1]
                : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
        }
    }
    return m[b.length][a.length];
}

const items = Array.from(document.querySelectorAll('.item')).map(item => ({
    element: item,
    text: item.querySelector('span').textContent.toLowerCase()
}));
const searchCache = new Map();

function filterItems() {
    const searchInput = document.getElementById('search').value.toLowerCase().trim();
    const categories = document.querySelectorAll('.category');
    const clearBtn = document.querySelector('.clear-btn');
    clearBtn.style.display = searchInput ? 'block' : 'none';
    let hasMatches = false;

    // Reset all items and categories
    items.forEach(item => {
        item.element.classList.remove('match', 'fuzzy-match', 'hidden');
    });
    categories.forEach(category => {
        category.classList.remove('hidden');
        category.querySelector('h2').style.display = 'block';
    });

    if (!searchInput) {
        return;
    }

    categories.forEach(category => category.classList.add('hidden'));
    const words = searchInput.split(/\s+/);

    items.forEach(item => {
        let isMatch = false;
        let isFuzzy = false;
        let minDistance = Infinity;

        const cacheKey = `${searchInput}|${item.text}`;
        let cachedResult = searchCache.get(cacheKey);

        if (!cachedResult) {
            const itemWords = item.text.split(/\s+/);
            words.forEach(searchWord => {
                itemWords.forEach(itemWord => {
                    if (itemWord.startsWith(searchWord) || itemWord.includes(searchWord)) {
                        isMatch = true;
                    } else {
                        const distance = levenshteinDistance(searchWord, itemWord);
                        const threshold = Math.min(3, Math.floor(itemWord.length / 3));
                        if (distance <= threshold && distance < minDistance) {
                            isFuzzy = true;
                            minDistance = distance;
                        }
                    }
                });
            });
            cachedResult = { isMatch, isFuzzy };
            searchCache.set(cacheKey, cachedResult);
        } else {
            isMatch = cachedResult.isMatch;
            isFuzzy = cachedResult.isFuzzy;
        }

        if (isMatch) {
            item.element.classList.add('match');
            item.element.classList.remove('hidden');
            hasMatches = true;
        } else if (isFuzzy) {
            item.element.classList.add('fuzzy-match');
            item.element.classList.remove('hidden');
            hasMatches = true;
        } else {
            item.element.classList.add('hidden');
        }
    });

    if (hasMatches) {
        items.forEach(item => {
            if (!item.element.classList.contains('hidden')) {
                const category = item.element.parentElement;
                category.classList.remove('hidden');
                category.querySelector('h2').style.display = 'block';
            }
        });
    }
}

function clearSearch() {
    const searchInput = document.getElementById('search');
    searchInput.value = '';
    searchInput.style.animation = 'shake 0.3s ease-out';
    setTimeout(() => searchInput.style.animation = '', 300);
    filterItems();
}

function openModal() {
    const modal = document.getElementById('recipesModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    const modal = document.getElementById('recipesModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedFilterItems = debounce(filterItems, 300);

window.onclick = e => {
    const modal = document.getElementById('recipesModal');
    if (e.target === modal) closeModal();
};
