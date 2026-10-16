const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeNavigation = () => {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpening = navToggle.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("is-open", isOpening);
    navToggle.setAttribute("aria-expanded", String(isOpening));
    document.body.classList.toggle("nav-open", isOpening);
  });
  navLinks.forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeNavigation();
    navToggle.focus();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeNavigation();
  });
}

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -28px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${current.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -68%", threshold: [0, 0.15, 0.4] },
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}

const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
const projectCards = [...document.querySelectorAll("[data-project-category]")];

projectFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;
    projectFilters.forEach((item) => item.classList.toggle("is-active", item === button));
    projectCards.forEach((card) => {
      const categories = card.dataset.projectCategory.split(" ");
      const visible = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-filtered", !visible);
      if (!visible) card.open = false;
    });
  });
});

projectCards.forEach((card) => {
  card.addEventListener("toggle", () => {
    if (!card.open) return;
    projectCards.forEach((otherCard) => {
      if (otherCard !== card) otherCard.open = false;
    });
  });
});

const translationNodes = [...document.querySelectorAll("[data-i18n]")];
const translatedAltNodes = [...document.querySelectorAll("[data-i18n-alt]")];
const originalContent = new Map(translationNodes.map((node) => [node.dataset.i18n, node.innerHTML]));
const originalAlt = new Map(translatedAltNodes.map((node) => [node.dataset.i18nAlt, node.getAttribute("alt")]));
const languageSelect = document.querySelector("[data-language-select]");
const translations = window.portfolioTranslations || {};

const getNestedValue = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);

const applyLanguage = (language) => {
  const dictionary = translations[language];
  translationNodes.forEach((node) => {
    const key = node.dataset.i18n;
    const value = language === "en" ? originalContent.get(key) : getNestedValue(dictionary, key);
    node.innerHTML = value ?? originalContent.get(key);
  });
  translatedAltNodes.forEach((node) => {
    const key = node.dataset.i18nAlt;
    const value = language === "en" ? originalAlt.get(key) : getNestedValue(dictionary, key);
    node.setAttribute("alt", value ?? originalAlt.get(key));
  });

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  if (languageSelect) languageSelect.value = language;
  closeNavigation();

  try { window.localStorage.setItem("portfolio-language", language); } catch { /* Storage can be unavailable on local files. */ }
  window.dispatchEvent(new CustomEvent("portfolio-language-change", { detail: { language } }));
};

if (languageSelect) {
  let savedLanguage = "en";
  try { savedLanguage = window.localStorage.getItem("portfolio-language") || "en"; } catch { /* Use English fallback. */ }
  if (![...languageSelect.options].some((option) => option.value === savedLanguage)) savedLanguage = "en";
  applyLanguage(savedLanguage);
  languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));
}

const canvas = document.querySelector("#skill-canvas");
const cursorGlow = document.querySelector("[data-cursor-glow]");

if (canvas) {
  const context = canvas.getContext("2d");
  const skillSets = {
    en: ["OPERATIONS", "SUPPLY CHAIN", "ANALYTICS", "GLOBAL STRATEGY", "OPTIMIZATION", "QUALITY", "COMPLIANCE", "PROCUREMENT", "FORECASTING", "LEADERSHIP", "EXCEL", "POWER BI", "TABLEAU", "SPSS", "LINGO", "RESEARCH"],
    hi: ["संचालन", "आपूर्ति शृंखला", "विश्लेषण", "वैश्विक रणनीति", "अनुकूलन", "गुणवत्ता", "अनुपालन", "खरीद", "पूर्वानुमान", "नेतृत्व"],
    fr: ["OPÉRATIONS", "LOGISTIQUE", "ANALYSE", "STRATÉGIE", "OPTIMISATION", "QUALITÉ", "CONFORMITÉ", "ACHATS", "PRÉVISION", "LEADERSHIP"],
    mr: ["कार्यसंचालन", "पुरवठा साखळी", "विश्लेषण", "जागतिक धोरण", "ऑप्टिमायझेशन", "गुणवत्ता", "अनुपालन", "खरेदी", "अंदाज", "नेतृत्व"],
    es: ["OPERACIONES", "SUMINISTRO", "ANALÍTICA", "ESTRATEGIA", "OPTIMIZACIÓN", "CALIDAD", "CUMPLIMIENTO", "COMPRAS", "PRONÓSTICO", "LIDERAZGO"],
    ar: ["العمليات", "سلسلة الإمداد", "التحليلات", "الاستراتيجية", "التحسين", "الجودة", "الامتثال", "المشتريات", "التنبؤ", "القيادة"],
    pt: ["OPERAÇÕES", "SUPRIMENTOS", "ANÁLISE", "ESTRATÉGIA", "OTIMIZAÇÃO", "QUALIDADE", "CONFORMIDADE", "COMPRAS", "PREVISÃO", "LIDERANÇA"],
    de: ["BETRIEB", "LIEFERKETTE", "ANALYTIK", "STRATEGIE", "OPTIMIERUNG", "QUALITÄT", "COMPLIANCE", "BESCHAFFUNG", "PROGNOSE", "FÜHRUNG"],
    ja: ["オペレーション", "サプライチェーン", "分析", "グローバル戦略", "最適化", "品質", "コンプライアンス", "調達", "予測", "リーダーシップ"],
  };
  const pointer = { x: -1000, y: -1000, active: false };
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let floatingSkills = [];
  let animationFrame = null;
  let resizeTimer = null;
  let activeLanguage = document.documentElement.lang || "en";

  const createFloatingSkills = () => {
    const source = skillSets[activeLanguage] || skillSets.en;
    const count = viewportWidth < 700 ? Math.min(8, source.length) : Math.min(16, source.length);
    floatingSkills = source.slice(0, count).map((label, index) => ({
      label,
      x: ((index * 0.618033 + 0.09) % 1) * viewportWidth,
      y: ((index * 0.381966 + 0.15) % 1) * viewportHeight,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.12,
      size: 9 + (index % 4) * 1.4,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const resizeCanvas = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewportWidth * ratio);
    canvas.height = Math.round(viewportHeight * ratio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createFloatingSkills();
  };

  const drawConnections = () => {
    for (let first = 0; first < floatingSkills.length; first += 1) {
      for (let second = first + 1; second < floatingSkills.length; second += 1) {
        const dx = floatingSkills[first].x - floatingSkills[second].x;
        const dy = floatingSkills[first].y - floatingSkills[second].y;
        const distance = Math.hypot(dx, dy);
        if (distance > 170) continue;
        context.beginPath();
        context.moveTo(floatingSkills[first].x, floatingSkills[first].y);
        context.lineTo(floatingSkills[second].x, floatingSkills[second].y);
        context.strokeStyle = `rgba(237, 200, 115, ${(1 - distance / 170) * 0.04})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }
  };

  const drawFrame = (animate = true) => {
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    drawConnections();
    floatingSkills.forEach((skill, index) => {
      const dx = skill.x - pointer.x;
      const dy = skill.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const proximity = pointer.active ? Math.max(0, 1 - distance / 200) : 0;
      if (animate) {
        skill.vx += Math.sin(performance.now() * 0.00024 + skill.phase) * 0.0014;
        skill.vy += Math.cos(performance.now() * 0.00021 + skill.phase) * 0.0011;
        if (proximity > 0 && distance > 0) {
          const force = proximity * 0.07;
          skill.vx += (dx / distance) * force;
          skill.vy += (dy / distance) * force;
        }
        skill.vx *= 0.985;
        skill.vy *= 0.985;
        const speed = Math.hypot(skill.vx, skill.vy);
        if (speed > 1.25) { skill.vx = (skill.vx / speed) * 1.25; skill.vy = (skill.vy / speed) * 1.25; }
        skill.x += skill.vx;
        skill.y += skill.vy;
        if (skill.x < -180) skill.x = viewportWidth + 20;
        if (skill.x > viewportWidth + 180) skill.x = -20;
        if (skill.y < -35) skill.y = viewportHeight + 20;
        if (skill.y > viewportHeight + 35) skill.y = -20;
      }
      context.font = `600 ${skill.size}px Manrope, sans-serif`;
      context.fillStyle = `rgba(237, 200, 115, ${0.045 + proximity * 0.24 + (index % 3) * 0.008})`;
      context.shadowBlur = proximity * 18;
      context.shadowColor = "rgba(237, 200, 115, 0.5)";
      context.fillText(skill.label, skill.x, skill.y);
      context.shadowBlur = 0;
    });
    if (animate) animationFrame = window.requestAnimationFrame(() => drawFrame(true));
  };

  resizeCanvas();
  drawFrame(!reduceMotion);

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { resizeCanvas(); if (reduceMotion) drawFrame(false); }, 160);
  });
  window.addEventListener("portfolio-language-change", (event) => {
    activeLanguage = event.detail.language;
    createFloatingSkills();
    if (reduceMotion) drawFrame(false);
  });

  if (finePointer) {
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      cursorGlow?.classList.add("is-visible");
      if (cursorGlow) cursorGlow.style.transform = `translate3d(${event.clientX - 215}px, ${event.clientY - 215}px, 0)`;
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { pointer.active = false; cursorGlow?.classList.remove("is-visible"); });
  }

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    if (document.hidden && animationFrame) { window.cancelAnimationFrame(animationFrame); animationFrame = null; }
    else if (!document.hidden && !animationFrame) drawFrame(true);
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
