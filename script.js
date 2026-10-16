const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeNavigation = () => {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector(".sr-only").textContent = "Open navigation";
  document.body.classList.remove("nav-open");
};

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    nav.classList.toggle("is-open", !isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.querySelector(".sr-only").textContent = isOpen ? "Open navigation" : "Close navigation";
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNavigation));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeNavigation();
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
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -65%", threshold: [0, 0.2, 0.5] },
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}

const careerTabs = [...document.querySelectorAll("[data-career-tab]")];
const careerPanels = [...document.querySelectorAll("[data-career-panel]")];

const selectCareerMilestone = (key, shouldFocus = false) => {
  careerTabs.forEach((tab) => {
    const isActive = tab.dataset.careerTab === key;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
    if (isActive && shouldFocus) tab.focus();
  });

  careerPanels.forEach((panel) => {
    panel.hidden = panel.dataset.careerPanel !== key;
  });
};

careerTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectCareerMilestone(tab.dataset.careerTab));
  tab.addEventListener("mouseenter", () => selectCareerMilestone(tab.dataset.careerTab));
  tab.addEventListener("focus", () => selectCareerMilestone(tab.dataset.careerTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
    const nextIndex = (index + direction + careerTabs.length) % careerTabs.length;
    selectCareerMilestone(careerTabs[nextIndex].dataset.careerTab, true);
  });
});

const projectCards = [...document.querySelectorAll(".project-card")];
projectCards.forEach((card) => {
  card.addEventListener("toggle", () => {
    if (!card.open) return;
    projectCards.forEach((otherCard) => {
      if (otherCard !== card) otherCard.open = false;
    });
  });
});

const canvas = document.querySelector("#skill-canvas");
const cursorGlow = document.querySelector("[data-cursor-glow]");

if (canvas) {
  const context = canvas.getContext("2d");
  const allSkills = [
    "OPERATIONS",
    "SUPPLY CHAIN",
    "ANALYTICS",
    "GLOBAL STRATEGY",
    "PROCESS IMPROVEMENT",
    "QUALITY",
    "COMPLIANCE",
    "PROCUREMENT",
    "KPI MONITORING",
    "EXCEL",
    "POWER BI",
    "TABLEAU",
    "PYTHON",
    "SALESFORCE",
    "SPSS",
    "LINGO",
    "MARKET ANALYSIS",
    "PROGRAM OPERATIONS",
  ];
  const pointer = { x: -1000, y: -1000, active: false };
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let floatingSkills = [];
  let animationFrame = null;
  let resizeTimer = null;

  const createFloatingSkills = () => {
    const count = viewportWidth < 700 ? 10 : allSkills.length;
    floatingSkills = allSkills.slice(0, count).map((label, index) => ({
      label,
      x: ((index * 0.618033 + 0.11) % 1) * viewportWidth,
      y: ((index * 0.381966 + 0.17) % 1) * viewportHeight,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.13,
      size: 9 + (index % 4) * 1.5,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const resizeCanvas = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createFloatingSkills();
  };

  const drawConnections = () => {
    for (let first = 0; first < floatingSkills.length; first += 1) {
      for (let second = first + 1; second < floatingSkills.length; second += 1) {
        const dx = floatingSkills[first].x - floatingSkills[second].x;
        const dy = floatingSkills[first].y - floatingSkills[second].y;
        const distance = Math.hypot(dx, dy);
        if (distance > 165) continue;
        const alpha = (1 - distance / 165) * 0.035;
        context.beginPath();
        context.moveTo(floatingSkills[first].x, floatingSkills[first].y);
        context.lineTo(floatingSkills[second].x, floatingSkills[second].y);
        context.strokeStyle = `rgba(226, 194, 117, ${alpha})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }
  };

  const drawFrame = (shouldAnimate = true) => {
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    drawConnections();

    floatingSkills.forEach((skill, index) => {
      const dx = skill.x - pointer.x;
      const dy = skill.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const proximity = pointer.active ? Math.max(0, 1 - distance / 190) : 0;

      if (shouldAnimate) {
        skill.vx += Math.sin(performance.now() * 0.00025 + skill.phase) * 0.0015;
        skill.vy += Math.cos(performance.now() * 0.0002 + skill.phase) * 0.0012;

        if (proximity > 0 && distance > 0) {
          const force = proximity * 0.075;
          skill.vx += (dx / distance) * force;
          skill.vy += (dy / distance) * force;
        }

        skill.vx *= 0.985;
        skill.vy *= 0.985;
        const speed = Math.hypot(skill.vx, skill.vy);
        if (speed > 1.35) {
          skill.vx = (skill.vx / speed) * 1.35;
          skill.vy = (skill.vy / speed) * 1.35;
        }

        skill.x += skill.vx;
        skill.y += skill.vy;

        if (skill.x < -160) skill.x = viewportWidth + 20;
        if (skill.x > viewportWidth + 160) skill.x = -20;
        if (skill.y < -30) skill.y = viewportHeight + 20;
        if (skill.y > viewportHeight + 30) skill.y = -20;
      }

      const alpha = 0.045 + proximity * 0.22 + (index % 3) * 0.008;
      context.font = `600 ${skill.size}px Inter, sans-serif`;
      context.letterSpacing = "1px";
      context.fillStyle = `rgba(226, 194, 117, ${alpha})`;
      context.shadowBlur = proximity * 18;
      context.shadowColor = "rgba(226, 194, 117, 0.45)";
      context.fillText(skill.label, skill.x, skill.y);
      context.shadowBlur = 0;
    });

    if (shouldAnimate) animationFrame = window.requestAnimationFrame(() => drawFrame(true));
  };

  resizeCanvas();
  if (reduceMotion) drawFrame(false);
  else drawFrame(true);

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      if (reduceMotion) drawFrame(false);
    }, 160);
  });

  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        if (cursorGlow) {
          cursorGlow.classList.add("is-visible");
          cursorGlow.style.transform = `translate3d(${event.clientX - 210}px, ${event.clientY - 210}px, 0)`;
        }
      },
      { passive: true },
    );

    document.documentElement.addEventListener("mouseleave", () => {
      pointer.active = false;
      cursorGlow?.classList.remove("is-visible");
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    if (document.hidden && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    } else if (!document.hidden && !animationFrame) {
      drawFrame(true);
    }
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
