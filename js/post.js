(function () {
  // Every absolute URL this file emits (canonical, og:image, JSON-LD) is built
  // from this constant rather than window.location, so a visit through the apex
  // never advertises a non-www variant to crawlers and social scrapers.
  const SITE_ORIGIN = 'https://www.piotrbak.bio';

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('post');
  const container = document.getElementById('post-container');

  if (!container) return;

  // post.html sets send_page_view:false, so the hit is sent from here — once
  // the real title and canonical URL are known. Error paths report too, so
  // broken links still show up in GA4 instead of vanishing.
  function sendPageView(pageLocation) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: pageLocation || window.location.href
    });
  }

  if (!slug) {
    renderError('Brak parametru artykułu.', 'Nie wskazano, który artykuł wczytać.');
    sendPageView();
    return;
  }

  // Find the post.
  // Some slugs are stored percent-encoded (e.g. "...osob%21"), but
  // URLSearchParams.get() already decodes the query value, so a strict
  // comparison would miss them. Normalise both sides before matching.
  function decodeSlug(s) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }

  const decodedSlug = decodeSlug(slug);
  const post = BLOG_POSTS.find(p => p.slug === slug)
            || BLOG_POSTS.find(p => decodeSlug(p.slug) === decodedSlug);

  if (!post) {
    renderError('Artykuł nie odnaleziony.', 'Przepraszamy, ten wpis nie istnieje lub został przeniesiony.');
    sendPageView();
    return;
  }

  // Update Page Title and Meta Tags
  document.title = `${post.title} · Piotr Bąk`;

  // Reported against the canonical URL so GA4 groups each article under one
  // address regardless of how the visitor arrived (redirect, decoded slug…).
  sendPageView(`${SITE_ORIGIN}/post.html?post=${post.slug}`);

  const metaDesc = document.getElementById('meta-description');
  if (metaDesc) metaDesc.setAttribute('content', post.short);

  // The stored (already percent-encoded) slug keeps this identical to sitemap.xml.
  const canonical = document.getElementById('canonical');
  if (canonical) {
    canonical.setAttribute('href', `${SITE_ORIGIN}/post.html?post=${post.slug}`);
  }

  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', `${post.title} · Piotr Bąk`);

  const ogDesc = document.getElementById('og-description');
  if (ogDesc) ogDesc.setAttribute('content', post.short);

  const thumb = post.thumbnail || 'assets/blog/default.jpg';
  const fullThumbUrl = SITE_ORIGIN + '/' + thumb.replace(/^\//, '');

  const ogImage = document.getElementById('og-image');
  if (ogImage) ogImage.setAttribute('content', fullThumbUrl);

  const twitterTitle = document.getElementById('twitter-title');
  if (twitterTitle) twitterTitle.setAttribute('content', `${post.title} · Piotr Bąk`);

  const twitterDesc = document.getElementById('twitter-description');
  if (twitterDesc) twitterDesc.setAttribute('content', post.short);

  const twitterImage = document.getElementById('twitter-image');
  if (twitterImage) twitterImage.setAttribute('content', fullThumbUrl);

  // ============ Schema.org JSON-LD & Date Parsing ============
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
    if (!dateStr) return new Date();
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

  try {
    const publishedDate = parsePlDate(post.date).toISOString().split('T')[0];
    const articleUrl = `${SITE_ORIGIN}/post.html?post=${post.slug}`;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        // Matches the canonical, not window.location.href, so the structured
        // data and the canonical never disagree about which URL this is.
        "@id": articleUrl
      },
      "headline": post.title,
      "description": post.short,
      "image": fullThumbUrl,
      "datePublished": publishedDate,
      "dateModified": publishedDate,
      "author": {
        "@type": "Person",
        "name": "Piotr Bąk",
        "url": SITE_ORIGIN + '/'
      },
      "publisher": {
        "@type": "Person",
        "name": "Piotr Bąk",
        "url": SITE_ORIGIN + '/'
      }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  } catch (e) {
    console.error("Schema JSON-LD injection error:", e);
  }

  // Render post content
  container.innerHTML = `
    <header class="post-header rise">
      <a href="blog.html" class="btn-back"><svg data-lucide="arrow-left"></svg> Wszystkie wpisy</a>
      <div class="post-date">${post.date}</div>
      <h1>${post.title}</h1>
    </header>

    <img class="post-hero-img rise d1" src="${thumb}" alt="${post.title}">

    <div class="post-body rise d2">
      ${post.content}
    </div>

    <div class="post-footer rise d3">
      <a href="blog.html" class="btn-back"><svg data-lucide="arrow-left"></svg> Powrót do bloga</a>
    </div>
  `;

  // Ensure all images in the post body have alt tags for SEO and accessibility
  const bodyImages = container.querySelectorAll('.post-body img');
  bodyImages.forEach((img, idx) => {
    if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
      img.setAttribute('alt', `${post.title} - ilustracja ${idx + 1}`);
    }
  });

  // Clean up inline styles (especially webwave fonts) to use our consistent Plus Jakarta Sans font
  const allBodyElements = container.querySelectorAll('.post-body *');
  allBodyElements.forEach(el => {
    if (el.style.fontFamily) {
      el.style.fontFamily = '';
    }
  });

  // Remove empty paragraphs and spacers from Webwave scraped content
  const paragraphs = container.querySelectorAll('.post-body p');
  paragraphs.forEach(p => {
    const text = p.textContent.replace(/\u00a0/g, '').replace(/&nbsp;/g, '').trim();
    const html = p.innerHTML.trim();
    if (text === '' && (html === '' || html === '<br>' || html === '<br/>' || html === ' ' || html === '&nbsp;')) {
      p.style.display = 'none';
    }
  });

  // Re-trigger icon rendering
  if (window.ICONS_LOADED) {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  function renderError(title, msg) {
    container.innerHTML = `
      <div class="error-container">
        <h2>${title}</h2>
        <p>${msg}</p>
        <a href="blog.html" class="btn-primary" style="margin-top: var(--s-4); display: inline-flex; text-decoration: none;"><svg data-lucide="arrow-left"></svg> Powrót do bloga</a>
      </div>
    `;
    if (window.ICONS_LOADED) {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }
  }
})();
