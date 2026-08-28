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

  const SITE_ORIGIN = 'https://www.piotrbak.bio';
  const postsPerPage = 10;
  let filteredPosts = [...BLOG_POSTS];

  const grid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('search-input');
  const pagination = document.getElementById('pagination');

  // ?page=N is the source of truth for which page is shown, so every page can
  // be linked, shared and crawled instead of living only in a click handler.
  function pageFromUrl() {
    const n = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  // Page 1 stays on the bare /blog.html so it never duplicates ?page=1.
  function pagePath(n) {
    return n <= 1 ? 'blog.html' : `blog.html?page=${n}`;
  }

  let currentPage = pageFromUrl();

  function renderPosts() {
    if (!grid) return;
    grid.innerHTML = '';

    if (filteredPosts.length === 0) {
      grid.innerHTML = '<div class="no-results">Brak wyników pasujących do wyszukiwania.</div>';
      if (pagination) pagination.innerHTML = '';
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
      // Same rule as js/post.js: describe the picture when the post says what
      // it shows, and fall back to the title only when it doesn't.
      const thumbAlt = post.thumbnailAlt || post.title;

      card.innerHTML = `
        <img class="blog-card-img" src="${thumb}" alt="${thumbAlt}" loading="lazy">
        <div class="blog-card-body">
          <div class="blog-card-date">${post.date}</div>
          <h3>${post.title}</h3>
          <p>${post.short}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    renderPagination(totalPages);
    updateHeadLinks(totalPages);

    // Trigger Lucide icon rebuild in case new icons are injected
    if (window.ICONS_LOADED) {
      // Re-trigger our custom main.js icon injector
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }
  }

  // Anchors cannot be :disabled, so edge arrows drop their href and get a class.
  function navLink(page, disabled, html) {
    const a = document.createElement('a');
    a.className = 'pagination-btn' + (disabled ? ' is-disabled' : '');
    a.innerHTML = html;
    if (disabled) {
      a.setAttribute('aria-disabled', 'true');
    } else {
      a.href = pagePath(page);
      a.dataset.page = String(page);
    }
    return a;
  }

  // Every page number is a real link, so a crawler reaches page 13 in one hop
  // from page 1 rather than having to walk thirteen "next" clicks.
  function renderPagination(totalPages) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const frag = document.createDocumentFragment();
    frag.appendChild(navLink(currentPage - 1, currentPage === 1,
      '<svg data-lucide="arrow-left"></svg> Nowsze'));

    for (let n = 1; n <= totalPages; n++) {
      const a = document.createElement('a');
      a.className = 'pagination-num' + (n === currentPage ? ' is-current' : '');
      a.href = pagePath(n);
      a.dataset.page = String(n);
      a.textContent = String(n);
      a.setAttribute('aria-label', `Strona ${n}`);
      if (n === currentPage) a.setAttribute('aria-current', 'page');
      frag.appendChild(a);
    }

    frag.appendChild(navLink(currentPage + 1, currentPage === totalPages,
      'Starsze <svg data-lucide="arrow-right"></svg>'));

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Strona ${currentPage} z ${totalPages}`;
    frag.appendChild(info);

    pagination.appendChild(frag);
  }

  function setHeadLink(id, rel, href) {
    let el = document.getElementById(id);
    if (!href) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('link');
      el.id = id;
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  function updateHeadLinks(totalPages) {
    setHeadLink('canonical', 'canonical', `${SITE_ORIGIN}/${pagePath(currentPage)}`);
    setHeadLink('rel-prev', 'prev',
      currentPage > 1 ? `${SITE_ORIGIN}/${pagePath(currentPage - 1)}` : null);
    setHeadLink('rel-next', 'next',
      currentPage < totalPages ? `${SITE_ORIGIN}/${pagePath(currentPage + 1)}` : null);
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

      // Filtering restarts at page 1, so drop a stale ?page= from the URL.
      currentPage = 1;
      if (window.location.search) history.replaceState(null, '', pagePath(1));
      renderPosts();
    });
  }

  // Pagination navigation — the links work on their own; this only upgrades
  // them to an in-place render so the 1.4 MB post database isn't re-parsed.
  if (pagination) {
    pagination.addEventListener('click', function (e) {
      const link = e.target.closest('a[data-page]');
      if (!link) return;
      // Leave modifier-clicks (open in new tab, etc.) to the browser.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      currentPage = parseInt(link.dataset.page, 10);
      history.pushState({ page: currentPage }, '', pagePath(currentPage));
      renderPosts();
      // pushState does not trigger GA4's automatic page_view, so pages 2-13
      // would otherwise never be measured.
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: `${SITE_ORIGIN}/${pagePath(currentPage)}`
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('popstate', function () {
    currentPage = pageFromUrl();
    renderPosts();
  });

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
