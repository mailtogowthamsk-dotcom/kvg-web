/* ============================================================
   கொங்கு வேட்டுவ கவுண்டர் சமூகம் — Main JavaScript
   Progressive enhancement only. Essential content works without JS.
   Sections:
   1. Helpers            8. Counters
   2. Header / nav       9. Renderers
   3. Back-to-top       10. Filters / search
   4. Scroll reveal     11. Lightbox
   5. Language switch   12. Video modal
   6. Cookie consent    13. Accordion
   7. Modals            14. Form validation
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Helpers ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));
  const D  = window.CommunityData || {};

  /* Language state (chrome-level TA/EN toggle) */
  let currentLang = "ta";
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupHeader();
    setupBackTop();
    setupReveal();
    setupLang();
    setupCookie();
    setupModals();
    setupAccordion();
    setupForms();
    animateCounters();
    // Page renderers (each guards on element presence)
    renderStats();
    renderAppFeatures();
    renderAppScreens();
    renderAppConfig();
    renderContactConfig();
    renderTestimonials();
    highlightNav();
    // Apply saved language last, once all dynamic nodes exist.
    applyLang(currentLang);
  }

  /* ---------- 2. Header / navigation ---------- */
  function setupHeader() {
    const header = $(".site-header");
    const burger = $(".hamburger");
    const menu   = $(".nav-menu");
    const backdrop = $(".nav-backdrop");

    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (burger && menu) {
      const toggle = (open) => {
        const isOpen = open ?? !menu.classList.contains("open");
        menu.classList.toggle("open", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
        if (backdrop) backdrop.classList.toggle("show", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
      };
      burger.addEventListener("click", () => toggle());
      if (backdrop) backdrop.addEventListener("click", () => toggle(false));
      $$(".nav-menu a").forEach(a => a.addEventListener("click", () => {
        if (window.innerWidth <= 960) toggle(false);
      }));
      document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
    }

    // Mobile dropdown expand
    $$(".has-dropdown > a").forEach(a => {
      a.addEventListener("click", (e) => {
        if (window.innerWidth <= 960) {
          e.preventDefault();
          a.parentElement.classList.toggle("open");
        }
      });
    });
  }

  /* Active nav highlight based on current file */
  function highlightNav() {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$(".nav-list a").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === page || (page === "" && href === "index.html")) {
        a.closest("li")?.classList.add("active");
      }
    });
  }

  /* ---------- 3. Back-to-top ---------- */
  function setupBackTop() {
    const btn = $(".back-top");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- 4. Scroll reveal ---------- */
  function setupReveal() {
    const els = $$(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(e => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- 5. Language switch (chrome-level TA <-> EN) ----------
     Translates interface strings only (nav, buttons, headings, footer,
     breadcrumbs, hero/CTA copy). Body paragraphs and heritage/legal
     content stay Tamil by design. Any string with no dictionary entry
     is left untouched (safe Tamil fallback).
     To add a string: add a "Tamil": "English" pair to CHROME_I18N.        */
  const CHROME_I18N = {
    /* nav + dropdowns */
    "முகப்பு": "Home", "எங்களைப் பற்றி": "About Us", "வரலாறு": "History",
    "சமூக வரலாறு": "Community History", "குறிப்பிடத்தக்க ஆளுமைகள்": "Notable Personalities",
    "குலங்கள்": "Kulams", "கோயில்கள்": "Temples", "சங்கங்கள்": "Sangams",
    "நிகழ்வுகள்": "Events", "தொகுப்பு": "Gallery", "புகைப்படங்கள்": "Photos",
    "காணொளிகள்": "Videos", "செயலி": "Mobile App", "திருமணம்": "Matrimony",
    "தொடர்பு": "Contact", "ஆளுமைகள்": "Personalities",
    /* header actions + brand */
    "⬇ பதிவிறக்க": "⬇ Download", "சமூக இணையதளம்": "Community Portal",
    /* hero (home) */
    "கொங்கு வேட்டுவ கவுண்டர் சமூகத்தின் வரலாறு, பண்பாடு மற்றும் உறவுகளை இணைக்கும் தளம்":
      "A platform connecting the history, culture and bonds of the Kongu Vettuva Gounder community",
    "நமது பாரம்பரியத்தைப் பாதுகாத்து, செய்திகளையும் நிகழ்வுகளையும் பகிர்ந்து, சமூக உறவுகளை வலுப்படுத்தும் ஒரு நவீன டிஜிட்டல் தளம்.":
      "A modern digital platform that preserves our heritage, shares news and events, and strengthens community bonds.",
    "எங்களைப் பற்றி அறிய": "Learn About Us", "செயலியைப் பதிவிறக்க": "Download the App",
    "சமூகத்தில் இணைய": "Join the Community",
    /* section eyebrows / headings (home + inner) */
    "எங்கள் சமூகம்": "Our Community", "ஒரு பார்வையில்": "At a Glance",
    "சமீபத்திய": "Latest", "வரவிருக்கும்": "Upcoming", "புதிய அறிமுகம்": "New Launch",
    "செயலி வசதிகள்": "App Features", "பாரம்பரியம்": "Heritage", "கருத்துகள்": "Testimonials",
    "சமூக நிகழ்வுகள்": "Community Events",
    "சமூகப் புள்ளிவிவரங்கள்": "Community Statistics", "புகைப்படத் தொகுப்பு": "Photo Gallery",
    "சமூகக் கருத்துகள்": "Community Voices", "செயலியில் என்ன இருக்கிறது": "What's in the App",
    "வரலாறு மற்றும் மரபு": "History & Heritage",
    "குறிப்பிடத்தக்க மற்றும் மரபுவழித் தொடர்புடைய ஆளுமைகள்": "Notable & Traditionally Associated Figures",
    "குலங்கள் மற்றும் குலதெய்வக் கோயில்கள்": "Kulams & Kuladeivam Temples",
    "குலம் தொடர்பான கோயில்கள்": "Temples Linked to Kulams",
    /* page-hero titles */
    "எங்கள் புதிய சமூக செயலி அறிமுகம்": "Introducing Our New Community App",
    "திருமணத் தகவல்": "Matrimony Information", "பொறுப்புத் துறப்பு": "Disclaimer",
    "தனியுரிமைக் கொள்கை": "Privacy Policy", "விதிமுறைகள் மற்றும் நிபந்தனைகள்": "Terms & Conditions",
    "குக்கீ கொள்கை": "Cookie Policy", "பக்கம் கிடைக்கவில்லை": "Page Not Found",
    /* CTA */
    "சமூகத்துடன் இணையுங்கள்": "Connect With the Community",
    "உறுப்பினராக இணைய": "Become a Member", "தொடர்பு கொள்ள": "Get in Touch",
    "இப்போதே பதிவிறக்குங்கள்": "Download Now",
    /* card labels */
    "மேலும் படிக்க": "Read more", 
    "அனைத்து நிகழ்வுகளும்": "All Events", "அனைத்து ஆளுமைகளும்": "All Personalities",
    "அனைத்துக் குலங்களும்": "All Kulams", "அனைத்துக் கோயில்களும்": "All Temples",
    "முழுத் தொகுப்பு": "Full Gallery", "முழு வரலாற்றைப் படிக்க": "Read Full History",
    "வழி காட்டு": "Directions", "பதிவு செய்ய": "Register",
    /* footer */
    "விரைவு இணைப்புகள்": "Quick Links", "சேவைகள்": "Services", "செய்திமடல்": "Newsletter",
    "சேர்": "Add", "தனியுரிமை": "Privacy", "விதிமுறைகள்": "Terms",
    "சமூக வரலாறு, பண்பாடு, செய்திகள் மற்றும் உறவுகளை இணைக்கும் தளம்.":
      "A platform connecting community history, culture, news and relationships.",
    /* cookie banner buttons */
    "விருப்பங்களைத் தேர்வு": "Preferences", "நிராகரிக்கவும்": "Reject", "ஏற்கவும்": "Accept",
    
    /* brand name (proper noun) */
    "கொங்கு வேட்டுவ கவுண்டர்": "Kongu Vettuva Gounder",
    /* inner-page section eyebrows */
    "நாங்கள் யார்": "Who We Are", "நோக்கங்கள்": "Our Goals", "டிஜிட்டல் நோக்கம்": "Digital Mission",
    "காலவரிசை": "Timeline", "வசதிகள்": "Features", "தகவல்": "Information", "முதன்மை": "Featured",
    "எவ்வாறு செயல்படுகிறது": "How It Works", "முந்தையவை": "Past", "தொடர்புடையவை": "Related", "FAQ": "FAQ",
    /* inner-page section headings (h2) */
    "சமூக மேம்பாட்டு இலக்குகள்": "Community Development Goals",
    "ஒற்றுமை, கல்வி மற்றும் முன்னேற்றத்தை மையமாகக் கொண்ட சமூகம்": "A Community Centred on Unity, Education and Progress",
    "ஒற்றுமையும் முன்னேற்றமும் மைய நோக்கமாக": "Unity and Progress at the Core",
    "செயலியின் நோக்கம்": "Purpose of the App", "வரலாற்றுக் காலவரிசை": "Historical Timeline",
    "வரவிருக்கும் நிகழ்வுகள்": "Upcoming Events", "நிறைவடைந்த நிகழ்வுகள்": "Past Events",
    "செயலியின் வசதிகள்": "App Features", "செயலி விவரங்கள்": "App Details",
    "அடிக்கடி கேட்கப்படும் கேள்விகள்": "Frequently Asked Questions",
    "எளிய நான்கு படிகள்": "Four Simple Steps", "வெற்றிக் கதைகள்": "Success Stories",
    "தொடர்பு படிவம்": "Contact Form", "தொடர்பு விவரங்கள்": "Contact Details",
    "பாதுகாப்பு வழிகாட்டுதல்கள்": "Safety Guidelines", "பாதுகாப்பு & தனியுரிமை": "Security & Privacy",
    "எவ்வாறு பதிவு செய்வது": "How to Register",
    "எங்கள் புதிய சமூக செயலி இப்போது Android-இல்": "Our New Community App is Now on Android",
    "செயலியில் திருமணப் பதிவைத் தொடங்குங்கள்": "Start Your Matrimony Registration in the App",
    "கண்ணியமான, பாதுகாப்பான திருமணப் பதிவுத் தளம்": "A Dignified, Secure Matrimony Platform",
    /* feature-card headings (home + about) */
    "ஒற்றுமையும் உறவும்": "Unity & Bonds", "கல்வியும் முன்னேற்றமும்": "Education & Progress",
    "பாரம்பரியப் பாதுகாப்பு": "Heritage Preservation",
    "எங்கள் நோக்கம்": "Our Mission", "எங்கள் பார்வை": "Our Vision", "எங்கள் மதிப்புகள்": "Our Values",
    "கல்வி முன்முயற்சிகள்": "Education Initiatives", "இளைஞர் மேம்பாடு": "Youth Development",
    "பெண்கள் பங்களிப்பு": "Women's Participation", "பண்பாட்டுப் பாதுகாப்பு": "Cultural Preservation",
    "சமூக நலன்": "Social Welfare", "டிஜிட்டல் சமூகம்": "Digital Community",
    /* card category chips (news / events / videos) */
    "கல்வி": "Education", 
    "நலன்": "Welfare", "சாதனை": "Achievement", 
    "வரவிருக்கிறது": "Upcoming", "நிறைவடைந்தது": "Completed",
    "சமூகக் கூட்டம்": "Community Meeting", "கோயில் விழா": "Temple Festival", "விளையாட்டு": "Sports",
    "சமூகம்": "Community", "கோயில்": "Temple",
    /* CTA-band paragraphs */
    "செய்திகள், நிகழ்வுகள் மற்றும் உறவுகளை ஒரே இடத்தில் அணுகுங்கள்.": "Access news, events and connections in one place.",
    "எங்கள் செயல்பாடுகளில் பங்கேற்று சமூக முன்னேற்றத்திற்குப் பங்களியுங்கள்.": "Take part in our activities and contribute to community progress.",
    "சமூகத்துடன் இணைந்திருக்க செயலியைப் பதிவிறக்கவும்.": "Download the app to stay connected with the community.",
    /* page-hero subtitles (inner pages) */
    "கொங்கு வேட்டுவ கவுண்டர் சமூகத்தின் நோக்கம், பார்வை மற்றும் மதிப்புகள்.": "The mission, vision and values of the Kongu Vettuva Gounder community.",
    "உறுப்பினர்களை இணைக்கும், செய்திகளைப் பகிரும், திருமணப் பதிவுகளை வழங்கும் Android செயலி.": "An Android app that connects members, shares news and offers matrimony profiles.",
    "கண்ணியமான, பாதுகாப்பான, குடும்பம் நிர்வகிக்கக்கூடிய திருமணப் பதிவுத் தளம்.": "A dignified, secure, family-managed matrimony platform.",
    "உங்கள் கருத்துகள், கேள்விகள் மற்றும் உறுப்பினர் கோரிக்கைகளுக்கு எங்களை அணுகவும்.": "Reach us for your feedback, questions and membership requests.",
    "உங்கள் தகவல்களை நாங்கள் எவ்வாறு கையாளுகிறோம்.": "How we handle your information.",
    "தளத்தைப் பயன்படுத்துவதற்கான விதிமுறைகள்.": "The terms for using this site.",
    "தளத்தில் உள்ள தகவல்கள் குறித்த முக்கிய குறிப்புகள்.": "Important notes about the information on this site.",
    "இத்தளம் குக்கீகளை எவ்வாறு பயன்படுத்துகிறது.": "How this site uses cookies.",
  };

  /* Selectors whose leaf (text-only) elements are safe to translate. */
  const I18N_SEL = [
    ".nav-list a", ".nav-actions .btn", ".brand__text span", ".brand__text strong",
    ".hero h1", ".hero p", ".hero__cta .btn",
    ".page-hero h1", ".page-hero p", ".breadcrumb a", ".breadcrumb li[aria-current]",
    ".sec-head .eyebrow", ".sec-head h2",
    ".app-band .eyebrow", ".app-band h2", ".section--maroon .eyebrow", ".section--maroon h2",
    ".cta-band h2", ".cta-band p", ".cta-band .btn",
    ".section .text-center > .btn",
    ".footer-col h4", ".footer-col a", ".footer-brand p",
    ".footer-bottom a", ".cookie-banner .btn"
  ].join(",");

  function setupLang() {
    currentLang = localStorage.getItem("vg_lang") === "en" ? "en" : "ta";
    $$(".lang-switch button").forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang === "en" ? "en" : "ta";
        localStorage.setItem("vg_lang", lang);
        applyLang(lang);
      });
    });
  }

  /* Translate chrome leaf (text-only) nodes for the current language.
     Idempotent — safe to call again whenever new nodes are injected. */
  function translateChrome() {
    $$(I18N_SEL).forEach(el => {
      if (el.children.length) return;                 // only text-only leaves
      if (!el.hasAttribute("data-i18n-ta")) {
        const orig = el.textContent.trim();
        if (!orig) return;
        el.setAttribute("data-i18n-ta", orig);
      }
      const ta = el.getAttribute("data-i18n-ta");
      el.textContent = (currentLang === "en" && CHROME_I18N[ta]) ? CHROME_I18N[ta] : ta;
    });
  }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ta";
    $$(".lang-switch button").forEach(b => b.classList.toggle("active", b.dataset.lang === currentLang));
    document.documentElement.setAttribute("lang", currentLang);

    // Re-translate chrome nodes for the new language.
    translateChrome();
  }

  /* ---------- 6. Cookie consent ---------- */
  function setupCookie() {
    const banner = $(".cookie-banner");
    if (!banner) return;
    const choice = localStorage.getItem("vg_cookie_consent");
    if (!choice) setTimeout(() => banner.classList.add("show"), 800);

    const save = (val) => {
      localStorage.setItem("vg_cookie_consent", val);
      localStorage.setItem("vg_cookie_ts", new Date().toISOString());
      banner.classList.remove("show");
      // NOTE: load analytics only if val === 'accepted' (add scripts here later)
    };
    $(".cookie-accept", banner)?.addEventListener("click", () => save("accepted"));
    $(".cookie-reject", banner)?.addEventListener("click", () => save("rejected"));
    $(".cookie-prefs", banner)?.addEventListener("click", () => save("essential-only"));
  }

  /* ---------- 7. Modals (generic, incl. correction) ---------- */
  function setupModals() {
    $$("[data-modal-open]").forEach(t => {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        const m = document.getElementById(t.dataset.modalOpen);
        if (m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); }
      });
    });
    $$(".modal").forEach(m => {
      const close = () => { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); };
      m.addEventListener("click", e => { if (e.target === m) close(); });
      $$("[data-modal-close]", m).forEach(b => b.addEventListener("click", close));
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    });
    // NOTE: the correction form uses [data-validate]; it is handled by setupForms().
  }

  /* ---------- 8. Counters ---------- */
  function animateCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      const dur = 1400, start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString("en-IN") + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString("en-IN") + suffix;
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(n => io.observe(n));
  }

  /* ---------- 9. Renderers ---------- */
  function renderStats() {
    const wrap = $("#statsGrid");
    if (!wrap || !D.communityStats) return;
    wrap.innerHTML = D.communityStats.map(s => `
      <div class="stat reveal">
        <div class="stat__num" data-count="${s.value}" data-suffix="${s.suffix}">0</div>
        <div class="stat__label">${esc(s.labelTa)}</div>
      </div>`).join("");
    animateCounters();
  }

  function renderAppFeatures() {
    const wrap = $("#appFeaturesGrid");
    if (!wrap || !D.appFeatures) return;
    wrap.innerHTML = D.appFeatures.map(f => `
      <div class="feature reveal">
        <div class="feature__icon" aria-hidden="true">${f.icon}</div>
        <h4>${esc(f.titleTa)}</h4>
        <p class="muted">${esc(f.descTa)}</p>
      </div>`).join("");
    setupReveal();
  }

  function renderAppScreens() {
    const track = $("#appCarousel");
    if (!track || !D.appScreens) return;
    track.innerHTML = D.appScreens.map((s, i) => `
      <div class="phone-mock" style="scroll-snap-align:center;flex:none;">
        <img src="${esc(s)}" alt="செயலி திரை ${i + 1}" loading="lazy">
      </div>`).join("");
    const prev = $("#appPrev"), next = $("#appNext");
    const step = () => track.querySelector(".phone-mock")?.offsetWidth + 20 || 280;
    prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  }

  function renderAppConfig() {
    const c = D.appConfig; if (!c) return;
    const name = $("#appName"); if (name && c.appNameTa) name.textContent = c.appNameTa;
    const play = $("#playBtn"); if (play && c.playStoreUrl) play.href = c.playStoreUrl;
  }

  function renderContactConfig() {
    const c = D.contactConfig; if (!c) return;
    const set = (sel, val) => { const el = $(sel); if (el && val) el.textContent = val; };
    set("#cAddress", c.addressTa); set("#cPhone", c.phone);
    set("#cEmail", c.email); set("#cHours", c.hoursTa);
    const form = $("#contactForm");
    if (form && c.formEndpoint) form.dataset.endpoint = c.formEndpoint;
  }

  function renderTestimonials() {
    const wrap = $("#testimonialsGrid");
    if (!wrap || !D.testimonials) return;
    wrap.innerHTML = D.testimonials.map(t => `
      <div class="testi reveal">
        <p>${esc(t.textTa)}</p>
        <div class="testi__who">
          <span class="avatar" aria-hidden="true">${esc(t.initial)}</span>
          <span><strong>${esc(t.nameTa)}</strong><span>${esc(t.roleTa)}</span></span>
        </div>
      </div>`).join("");
    setupReveal();
  }

  /* ---------- 10. Generic filter/search wiring ---------- */
  function wireFilter(searchSel, districtSel, extraSel, source, draw, matchText, matchDistrict) {
    const s = searchSel && $(searchSel);
    const d = districtSel && $(districtSel);
    // Populate district options from data
    if (d && !d.dataset.filled) {
      const set = [...new Set(source.map(x => x.district).filter(Boolean))];
      d.insertAdjacentHTML("beforeend", set.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join(""));
      d.dataset.filled = "1";
    }
    const apply = () => {
      const q = (s?.value || "").trim().toLowerCase();
      const dv = d?.value || "";
      draw(source.filter(x => matchText(x, q) && matchDistrict(x, dv)));
    };
    s?.addEventListener("input", apply);
    d?.addEventListener("change", apply);
  }

  /* ---------- 13. Accordion (FAQ) ---------- */
  function setupAccordion() {
    $$(".acc-head").forEach(head => {
      head.setAttribute("aria-expanded", "false");
      const panel = head.nextElementSibling;
      head.addEventListener("click", () => {
        const open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!open));
        panel.style.maxHeight = open ? null : panel.scrollHeight + "px";
      });
    });
  }

  /* ---------- 14. Form validation (contact + generic) ---------- */
  function setupForms() {
    $$("form[data-validate]").forEach(form => {
      form.setAttribute("novalidate", "");
      form.addEventListener("submit", e => {
        e.preventDefault();
        let ok = true;
        $$("[required]", form).forEach(field => {
          const group = field.closest(".field") || field.parentElement;
          const err = $(".error-msg", group);
          let msg = "";
          if (field.type === "checkbox" && !field.checked) msg = "இந்தத் தேர்வு அவசியம்.";
          else if (!field.value.trim()) msg = "இந்தப் புலம் அவசியம்.";
          else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) msg = "சரியான மின்னஞ்சலை உள்ளிடவும்.";
          else if (field.type === "tel" && !/^[0-9+\-\s]{8,15}$/.test(field.value)) msg = "சரியான தொலைபேசி எண்ணை உள்ளிடவும்.";
          group.classList.toggle("invalid", !!msg);
          if (err) err.textContent = msg;
          if (msg) ok = false;
        });
        if (ok) {
          const success = $(".form-success", form.parentElement) || $(".form-success", form);
          const endpoint = form.dataset.endpoint;
          // Prototype: DO NOT submit to a real endpoint unless configured.
          if (endpoint) {
            // fetch(endpoint, { method:'POST', body:new FormData(form) }) ... connect later
          }
          form.reset();
          if (success) { success.hidden = false; success.scrollIntoView({ behavior: "smooth", block: "center" }); }
        }
      });
      // live-clear errors
      $$("[required]", form).forEach(f => f.addEventListener("input", () => {
        const g = f.closest(".field") || f.parentElement;
        g.classList.remove("invalid");
        const err = $(".error-msg", g); if (err) err.textContent = "";
      }));
    });
  }

})();
