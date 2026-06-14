(function () {
  const MONTHS_PL = {
    'stycznia': 0, 'styczeń': 0,
    'lutego': 1, 'luty': 1,
    'marca': 2, 'marzec': 2,
    'kwietnia': 3, 'kwiecień': 3,
    'maja': 4, 'maj': 4,
    'czerwca': 5, 'czerwiec': 5,
    'lipca': 6, 'lipiec': 6,
    'sierpnia': 7, 'sierpień': 7,
    'września': 8, 'wrzesień': 8,
    'października': 9, 'październik': 9,
    'listopada': 10, 'listopad': 10,
    'grudnia': 11, 'grudzień': 11
  };

  function parsePlDate(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1].toLowerCase();
      const year = parseInt(parts[2], 10);
      const month = MONTHS_PL[monthStr] !== undefined ? MONTHS_PL[monthStr] : 0;
      return new Date(year, month, day);
    }
    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
      return new Date(parseInt(parts[0], 10), 0, 1);
    }
    return new Date(dateStr);
  }

  // Sort posts descending (newest first)
  BLOG_POSTS.sort((a, b) => parsePlDate(b.date) - parsePlDate(a.date));

  const postsPerPage = 10;
  let currentPage = 1;
  let filteredPosts = [...BLOG_POSTS];

  const grid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('search-input');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInfo = document.getElementById('page-info');

  function renderPosts() {
    if (!grid) return;
    grid.innerHTML = '';

    if (filteredPosts.length === 0) {
      grid.innerHTML = '<div class="no-results">Brak wyników pasujących do wyszukiwania.</div>';
      if (pageInfo) pageInfo.textContent = 'Strona 0 z 0';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * postsPerPage;
    const end = Math.min(start + postsPerPage, filteredPosts.length);
    const paginated = filteredPosts.slice(start, end);

    paginated.forEach(post => {
      const card = document.createElement('a');
      card.className = 'blog-card';
      card.href = `post.html?post=${post.slug}`;

      // Thumbnail check
      const thumb = post.thumbnail || 'assets/blog/default.jpg';

      card.innerHTML = `
        <img class="blog-card-img" src="${thumb}" alt="${post.title}" loading="lazy">
        <div class="blog-card-body">
          <div class="blog-card-date">${post.date}</div>
          <h3>${post.title}</h3>
          <p>${post.short}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    if (pageInfo) pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Trigger Lucide icon rebuild in case new icons are injected
    if (window.ICONS_LOADED) {
      // Re-trigger our custom main.js icon injector
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const query = e.target.value.toLowerCase().trim();
      
      filteredPosts = BLOG_POSTS.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const shortMatch = post.short.toLowerCase().includes(query);
        const contentMatch = post.content ? post.content.toLowerCase().includes(query) : false;
        return titleMatch || shortMatch || contentMatch;
      });

      currentPage = 1;
      renderPosts();
    });
  }

  // Pagination navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        renderPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Inject Blog Schema.org JSON-LD
  try {
    const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog · Piotr Bąk",
      "description": "Przemyślenia, poradniki i analizy ze świata AI, automatyzacji i no-code.",
      "url": window.location.href,
      "publisher": {
        "@type": "Person",
        "name": "Piotr Bąk",
        "url": origin
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  } catch (e) {
    console.error("Schema JSON-LD injection error:", e);
  }

  // Initial render
  renderPosts();
})();
