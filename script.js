const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const experienceSection = document.querySelector("#experience");
const educationSection = document.querySelector("#education");
if (experienceSection && educationSection) experienceSection.insertAdjacentElement("afterend", educationSection);

const projectsSection = document.querySelector("#projects");
const foundationHeading = educationSection?.querySelector(".subsection-heading:not(.centered)");
const foundationGrid = educationSection?.querySelector(".undergrad-grid");
const publicationCard = educationSection?.querySelector(".publication-card");
if (projectsSection && foundationHeading && foundationGrid && publicationCard) {
  const foundationSection = document.createElement("section");
  foundationSection.id = "foundation";
  foundationSection.className = "section-pad section-warm standalone-subsection";
  foundationSection.setAttribute("aria-labelledby", "foundation-title");
  foundationHeading.querySelector("h3")?.setAttribute("id", "foundation-title");
  const foundationShell = document.createElement("div");
  foundationShell.className = "page-shell";
  foundationShell.append(foundationHeading, foundationGrid, publicationCard);
  foundationSection.append(foundationShell);
  projectsSection.insertAdjacentElement("afterend", foundationSection);
}

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

const impactCounters = [...document.querySelectorAll("[data-counter-value]")];
const counterFormatter = new Intl.NumberFormat("en-US");

const showFinalCounterValue = (counter) => {
  const value = Number(counter.dataset.counterValue);
  const suffix = counter.dataset.counterSuffix || "";
  counter.textContent = `${counterFormatter.format(value)}${suffix}`;
  counter.classList.remove("is-counting");
};

const animateImpactCounter = (counter) => {
  if (counter.dataset.animated === "true") return;
  counter.dataset.animated = "true";

  const target = Number(counter.dataset.counterValue);
  const suffix = counter.dataset.counterSuffix || "";
  const digitCeiling = (10 ** String(Math.round(target)).length) - 1;
  const duration = 1250;
  const start = performance.now();
  let nextChange = 0;
  counter.classList.add("is-counting");

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    if (progress >= 1) {
      showFinalCounterValue(counter);
      return;
    }

    if (now >= nextChange) {
      let displayValue;
      if (progress < 0.72) {
        displayValue = Math.floor(Math.random() * (digitCeiling + 1));
      } else {
        const settle = (1 - progress) / 0.28;
        const spread = Math.max(1, Math.round(digitCeiling * settle * 0.08));
        displayValue = Math.max(0, target + Math.floor((Math.random() * 2 - 1) * spread));
      }
      counter.textContent = `${counterFormatter.format(displayValue)}${suffix}`;
      nextChange = now + 42;
    }

    window.requestAnimationFrame(update);
  };

  window.requestAnimationFrame(update);
};

if (reduceMotion || !("IntersectionObserver" in window)) {
  impactCounters.forEach(showFinalCounterValue);
} else {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateImpactCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });
  impactCounters.forEach((counter) => counterObserver.observe(counter));
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

const projectEnhancements = {
  "01": { categories: "analytics strategy", repo: "https://github.com/anaghabande/chile-tourism-data-analytics", skills: ["Diagnostic analytics", "Predictive analytics", "Prescriptive analytics", "Forecasting", "Optimization", "Tableau", "Investment allocation"] },
  "02": { categories: "marketing analytics", repo: "https://github.com/anaghabande/consumer-decision-making-experiment", skills: ["Experimental design", "SPSS", "Hypothesis testing", "Willingness to pay", "Consumer behavior"] },
  "03": { categories: "strategy finance", repo: "https://github.com/anaghabande/global-leadership-strategy", skills: ["International expansion", "Country selection", "Stakeholder strategy", "Strategy execution"] },
  "04": { categories: "analytics strategy", repo: "https://github.com/anaghabande/ai-machine-learning-business-strategy", skills: ["AI strategy", "Process redesign", "Procurement analytics", "Inclusion tradeoffs"] },
  "05": { categories: "marketing sustainability", repo: "https://github.com/anaghabande/consumer-decision-making-experiment", skills: ["Product development", "Sensory analysis", "Consumer research", "Quality measurement"] },
  "06": { categories: "sustainability strategy", repo: "https://github.com/anaghabande/global-entrepreneurship-sustainable-business", skills: ["Venture development", "Customer discovery", "Financial inclusion", "Business modeling"] },
  "07": { categories: "sustainability strategy", repo: "https://github.com/anaghabande/global-entrepreneurship-sustainable-business", skills: ["Systems thinking", "Biodiversity", "Stakeholder analysis", "Sustainable supply chains"] },
  "08": { categories: "strategy finance", repo: "https://github.com/anaghabande/emerging-market-global-strategy", skills: ["Competitive advantage", "Vertical integration", "Institutional environments", "Financial sustainability"] },
  "09": { categories: "strategy", repo: "https://github.com/anaghabande/global-leadership-strategy", skills: ["Supply-chain risk", "PESTLE", "SWOT", "Strategic diversification"] },
  "10": { categories: "strategy finance", repo: "https://github.com/anaghabande/global-leadership-strategy", skills: ["Market entry", "Five Forces", "Country prioritization", "Financial performance"] },
  "11": { categories: "strategy", repo: "https://github.com/anaghabande/global-negotiation-cross-cultural-strategy", skills: ["Cross-cultural strategy", "International negotiation", "Cultural analysis", "Strategic communication"] },
  "12": { categories: "marketing finance", repo: "https://github.com/anaghabande/global-marketing-data-visualization", skills: ["International marketing", "Pricing strategy", "Market analysis", "Tableau visualization"] },
};

projectCards.forEach((card, index) => {
  const number = String(index + 1).padStart(2, "0");
  const enhancement = projectEnhancements[number];
  if (!enhancement) return;
  card.dataset.projectCategory = enhancement.categories;

  const details = card.querySelector(".project-details");
  if (!details || details.querySelector(".project-link")) return;
  const skills = document.createElement("div");
  skills.className = "project-skills";
  skills.setAttribute("aria-label", "Methods and key skills");
  skills.innerHTML = enhancement.skills.map((skill) => `<span>${skill}</span>`).join("");

  const link = document.createElement("a");
  link.className = "project-link";
  link.href = enhancement.repo;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.innerHTML = 'View GitHub repository <span aria-hidden="true">↗</span>';
  details.append(skills, link);
});

const endorsementGrid = document.querySelector(".endorsement-grid");
if (endorsementGrid) {
  endorsementGrid.insertAdjacentHTML("beforeend", `<figure class="endorsement-card endorsement-featured glass-card reveal is-visible"><blockquote>“Anagha brings thoughtfulness, consistency, quiet efficiency, and dependability to the 100 Million Learners team.”</blockquote><details class="recommendation-full"><summary>Read full recommendation</summary><div><p>Anagha works on my 100 Million Learners team at Thunderbird School of Global Management, where she brings thoughtfulness, consistency, and a willingness to contribute wherever the team needs her. She manages our learner support inbox, giving her direct insight into the experiences and needs of learners around the world, while also supporting additional research and projects across the initiative.</p><p>I especially appreciate Anagha's quiet efficiency and dependability. She approaches her work thoughtfully, follows through on her responsibilities, and is always willing to take on something new. Her combination of research skills, attention to the needs of the people we serve, and willingness to support a wide range of projects would translate well to research, partnership, and mission-driven roles. I am very happy to recommend her.</p></div></details><figcaption><strong>Samantha Alvis, Ph.D.</strong><span>Executive Director · 100 Million Learners initiative</span><small>Managed Anagha directly · October 16, 2026</small></figcaption></figure>`);
}

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

const renderProjectTags = () => {
  document.querySelectorAll(".project-type").forEach((type) => {
    const source = type.dataset.i18n ? type.textContent : (type.dataset.tagSource || type.textContent);
    if (!type.dataset.i18n) type.dataset.tagSource = source;
    const tags = source.split(/\s*[·•]\s*/).filter(Boolean);
    type.replaceChildren(...tags.map((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      return chip;
    }));
  });
};

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
  renderProjectTags();

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
} else renderProjectTags();

const canvas = document.querySelector("#skill-canvas");
const cursorGlow = document.querySelector("[data-cursor-glow]");

if (canvas) {
  const context = canvas.getContext("2d");
  const skillSets = {
    en: ["OPERATIONS", "SUPPLY CHAIN", "ANALYTICS", "GLOBAL STRATEGY", "OPTIMIZATION", "QUALITY", "COMPLIANCE", "PROCUREMENT", "FORECASTING", "LEADERSHIP", "AGILE", "EXCEL", "POWER BI", "TABLEAU", "SPSS", "LINGO", "RESEARCH"],
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
    const count = viewportWidth < 700 ? Math.min(8, source.length) : Math.min(18, source.length);
    floatingSkills = source.slice(0, count).map((label, index) => ({
      label,
      x: ((index * 0.618033 + 0.09) % 1) * viewportWidth,
      y: ((index * 0.381966 + 0.15) % 1) * viewportHeight,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.2,
      size: 11 + (index % 5) * 2.2,
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
        skill.vx += Math.sin(performance.now() * 0.00024 + skill.phase) * 0.002;
        skill.vy += Math.cos(performance.now() * 0.00021 + skill.phase) * 0.0017;
        if (proximity > 0 && distance > 0) {
          const force = proximity * 0.07;
          skill.vx += (dx / distance) * force;
          skill.vy += (dy / distance) * force;
        }
        skill.vx *= 0.99;
        skill.vy *= 0.99;
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
      const baseOpacity = viewportWidth < 700 ? 0.1 : 0.14;
      context.fillStyle = `rgba(237, 200, 115, ${baseOpacity + proximity * 0.28 + (index % 4) * 0.025})`;
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

const copyContactValue = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  document.execCommand("copy");
  fallback.remove();
};

document.querySelectorAll("[data-copy-value]").forEach((button) => {
  const initialLabel = button.getAttribute("aria-label") || "Copy contact detail";
  button.addEventListener("click", async () => {
    try {
      await copyContactValue(button.dataset.copyValue);
      button.classList.add("is-copied");
      button.setAttribute("aria-label", "Copied");
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", initialLabel);
      }, 1800);
    } catch {
      button.setAttribute("aria-label", "Unable to copy");
    }
  });
});

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  const formStatus = contactForm.querySelector("[data-contact-form-status]");
  const submitButton = contactForm.querySelector("button[type='submit']");
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }
    if (formStatus) formStatus.textContent = "Sending…";

    try {
      const response = await fetch("https://formsubmit.co/ajax/abande25@asu.edu", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || result.success === "false" || result.success === false) throw new Error("Submission failed");
      contactForm.reset();
      if (formStatus) formStatus.textContent = "Message sent. Thank you.";
    } catch {
      if (formStatus) formStatus.innerHTML = 'Message could not be sent. Please email <a href="mailto:abande25@asu.edu">abande25@asu.edu</a>.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
