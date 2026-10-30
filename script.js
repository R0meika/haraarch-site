// projects:start
const projectNavItems = [
  {
    href: "vauxhall.html",
    number: "0.1",
    title: "Квартира ЖК Воксхолл",
    meta: "93.6 м² | г. Москва, Россия",
    status: "В реализации",
  },
  {
    href: "kushchevka.html",
    number: "0.2",
    title: "Частный жилой дом",
    meta: "350 м² | г. Ростов-на-Дону, Россия",
    status: "В реализации",
  },
  {
    href: "voronezh.html",
    number: "0.3",
    title: "Частный жилой дом",
    meta: "150 м² | г. Воронеж, Россия",
    status: "В реализации",
  },
  {
    href: "sydney-city.html",
    number: "0.4",
    title: "Квартира ЖК Сидней Сити",
    meta: "65 м² | г. Москва, Россия",
    status: "В разработке",
  },
  {
    href: "dacha-shale.html",
    number: "0.5",
    title: "Загородный дом",
    meta: "200 м² | г. Истра, Россия",
    status: "В разработке",
  },
  {
    href: "bali-villas.html",
    number: "0.6",
    title: "Комплекс из 4 вилл",
    meta: "450 м² | о. Бали, Индонезия",
    status: "В реализации",
  },
  {
    href: "almaty-reconstruction.html",
    number: "0.7",
    title: "Реконструкция кафе",
    meta: "140 м² | г. Алматы, Казахстан",
    status: "В разработке",
  },
  {
    href: "dom.html",
    number: "0.8",
    title: "Частный жилой дом",
    meta: "170 м² | Московская область, Россия",
    status: "В реализации",
  },
];
// projects:end

// services:start
const servicesPublished = false;
// services:end

const buildIntroOverlay = () => {
  const isHomePage = Boolean(document.getElementById("home")) && !document.querySelector(".project-page-main");
  const params = new URLSearchParams(window.location.search);
  const forceIntro = params.get("intro") === "1";
  const skipIntro = params.get("intro") === "0";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const storageKey = "haraIntroLine";
  let introSeen = false;

  try {
    introSeen = sessionStorage.getItem(storageKey) === "true";
  } catch (error) {
    introSeen = false;
  }

  const topbar = document.querySelector(".topbar");
  const brand = document.querySelector(".topbar .brand-word");

  if (!isHomePage || skipIntro || !topbar || !brand || window.scrollY > 0 || (!forceIntro && (reducedMotion || introSeen))) {
    return;
  }

  try {
    sessionStorage.setItem(storageKey, "true");
  } catch (error) {
    // Private browsing: the intro may repeat, that is fine.
  }

  // Letters come together, the accent falls, then a line rises into the header line and opens the site
  // while the logo lands in the header. Any click, key, scroll or touch skips it.
  const root = document.createElement("div");
  root.className = "hara-intro";
  root.setAttribute("aria-hidden", "true");
  document.body.append(root);

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const layer = (className, html = "") => {
    const node = document.createElement("div");
    node.className = className;
    node.innerHTML = html;
    root.append(node);
    return node;
  };
  const skipEvents = ["pointerdown", "keydown", "wheel", "touchstart"];
  let done = false;

  const finish = (quick) => {
    if (done) {
      return;
    }

    done = true;
    skipEvents.forEach((name) => window.removeEventListener(name, skip));

    if (quick) {
      root.style.transition = "opacity 260ms ease";
      root.style.opacity = "0";
      window.setTimeout(() => root.remove(), 280);
    } else {
      root.remove();
    }
  };

  function skip() {
    finish(true);
  }

  skipEvents.forEach((name) => window.addEventListener(name, skip, { passive: true }));
  layer("hi-cover");
  window.setTimeout(() => finish(false), 7000); // safety net: the site is never left covered

  const run = async () => {
    await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(900)]);
    await wait(60); // let the first layout settle (a plain timer also works in background tabs)

    if (done) {
      return;
    }

    const sw = root.clientWidth;
    const sh = root.clientHeight;
    const tb = topbar.getBoundingClientRect();
    const lr = brand.getBoundingClientRect();
    const after = window.getComputedStyle(topbar, "::after");
    const th = parseFloat(after.height) || 2;
    const lineY = tb.bottom - th;
    const lineL = tb.left + (parseFloat(after.left) || 0);
    const lineR = tb.right - (parseFloat(after.right) || 0);
    const brandStyle = window.getComputedStyle(brand.parentElement);

    const targetW = Math.min(sw * 0.55, 420);
    const s0 = targetW / lr.width;
    const startCy = sh * 0.42;
    const tx = sw / 2 - targetW / 2 - lr.left;
    const ty = startCy - (lr.height * s0) / 2 - lr.top;
    const y0 = startCy + (lr.height * s0) / 2 + 16;

    const bottom = layer("hi-bottom");
    bottom.style.top = `${y0}px`;
    const top = layer("hi-top");
    top.style.height = `${y0}px`;

    const letters = "ХАРА".split("").map((ch) => `<span class="hi-l">${ch}</span>`).join("");
    const logo = layer("hi-logo", `<span class="brand-word">${letters}<span class="accent-mark"></span></span>`);
    logo.style.left = `${lr.left}px`;
    logo.style.top = `${lr.top}px`;
    logo.style.font = brandStyle.font;
    logo.style.letterSpacing = brandStyle.letterSpacing;
    logo.style.lineHeight = brandStyle.lineHeight;
    logo.style.transform = `translate(${tx}px, ${ty}px) scale(${s0})`;

    const line = layer("hi-line");
    line.style.height = `${th}px`;
    line.style.top = `${y0}px`;
    line.style.left = `${sw / 2}px`;
    line.style.width = "0px";

    root.querySelector(".hi-cover").remove();

    const spans = [...logo.querySelectorAll(".hi-l")];
    const accent = logo.querySelector(".accent-mark");
    const spread = (sw * 0.2) / s0;
    spans.forEach((span, index) => {
      span.style.opacity = "0";
      span.style.transform = `translateX(${(index - 1.5) * spread}px)`;
    });
    accent.style.opacity = "0";
    accent.style.transform = "translateY(-0.5em) rotate(-58deg)";

    await wait(250);
    if (done) return;
    spans.forEach((span) => {
      span.style.transition = "opacity 350ms ease";
      span.style.opacity = "1";
    });
    await wait(400);
    if (done) return;
    spans.forEach((span) => {
      span.style.transition = "transform 750ms cubic-bezier(0.65, 0, 0.35, 1)";
      span.style.transform = "translateX(0)";
    });
    await wait(800);
    if (done) return;
    accent.style.transition = "opacity 250ms ease, transform 320ms ease";
    accent.style.opacity = "1";
    accent.style.transform = "translateY(0) rotate(-58deg)";
    await wait(380);
    if (done) return;
    logo.innerHTML = brand.outerHTML; // the exact header markup, so the landing matches pixel for pixel

    const ease = "950ms cubic-bezier(0.65, 0, 0.35, 1)";
    top.style.transition = `height ${ease}`;
    top.style.height = `${lineY + th}px`;
    line.style.transition = `top ${ease}, left ${ease}, width ${ease}`;
    line.style.top = `${lineY}px`;
    line.style.left = `${lineL}px`;
    line.style.width = `${lineR - lineL}px`;
    logo.style.transition = `transform ${ease}`;
    logo.style.transform = "translate(0px, 0px) scale(1)";
    bottom.style.transition = "opacity 400ms ease";
    bottom.style.opacity = "0";
    await wait(1000);
    if (done) return;
    top.style.transition = "opacity 250ms ease";
    top.style.opacity = "0";
    await wait(280);
    finish(false);
  };

  run().catch(() => finish(false));
};

const buildProjectIndex = () => {
  const projectMain = document.querySelector(".project-page-main");
  const shell = document.querySelector(".site-shell");

  if (!projectMain || !shell) {
    return;
  }

  document.body.classList.add("has-project-index");

  const currentFile = window.location.pathname.split("/").pop() || "";
  const projectIndex = document.createElement("aside");
  projectIndex.className = "project-index";
  projectIndex.setAttribute("aria-label", "Навигация по проектам");
  projectIndex.innerHTML = `
    <div class="project-index-block project-index-block--primary">
      <p class="project-index-title">Другие проекты</p>
      <nav class="project-index-list">
        ${projectNavItems
          .filter((item) => item.href !== currentFile)
          .map((item) => {
            const isCurrent = item.href === currentFile;
            return `
              <a class="project-index-link${isCurrent ? " is-current" : ""}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ""}>
                <span class="project-index-number">${item.number}</span>
                <span>
                  ${item.title}
                  <small>${item.meta} | ${item.status}</small>
                </span>
              </a>
            `;
          })
          .join("")}
      </nav>
    </div>
  `;

  shell.insertBefore(projectIndex, projectMain);

  const list = projectIndex.querySelector(".project-index-list");
  const currentLink = projectIndex.querySelector(".project-index-link.is-current");

  if (list && currentLink) {
    const centerCurrentProject = () => {
      list.scrollLeft = currentLink.offsetLeft - (list.clientWidth - currentLink.clientWidth) / 2;
    };

    window.requestAnimationFrame(centerCurrentProject);
    window.addEventListener("load", centerCurrentProject, { once: true });
  }

  const projectSwitcher = document.createElement("nav");
  projectSwitcher.className = "project-switcher";
  projectSwitcher.setAttribute("aria-label", "Другие проекты");
  projectSwitcher.innerHTML = `
    <p class="project-switcher-title">Другие проекты</p>
    <div class="project-switcher-list">
      ${projectNavItems
        .filter((item) => item.href !== currentFile)
        .map(
          (item) => `
            <a class="project-switcher-link" href="${item.href}">
              <span><span class="project-switcher-number">${item.number}</span>${item.title}</span>
              <small>${item.meta} | ${item.status}</small>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  projectMain.append(projectSwitcher);
};

const buildMobileServiceNav = () => {
  const shell = document.querySelector(".site-shell");
  const topbar = document.querySelector(".topbar");
  const projectMain = document.querySelector(".project-page-main");

  if (!shell || !topbar || projectMain || document.querySelector(".mobile-service-nav")) {
    return;
  }

  const serviceNav = document.createElement("nav");
  serviceNav.className = "mobile-service-nav";
  serviceNav.setAttribute("aria-label", "Разделы практики");
  serviceNav.innerHTML = `
    <a href="#practice">Концепция</a>
    <a href="#works" data-project-filter="architecture">Архитектура</a>
    <a href="#works" data-project-filter="design">Дизайн</a>
  `;

  topbar.insertAdjacentElement("afterend", serviceNav);
};

buildIntroOverlay();
buildMobileServiceNav();
buildProjectIndex();

const projectRows = document.querySelectorAll(".project-row[data-category]");
const projectFilterLinks = document.querySelectorAll("[data-project-filter]");

const scrollToWorks = (behavior = "smooth") => {
  const works = document.getElementById("works");

  if (!works) {
    return;
  }

  const visibleProject = document.querySelector(".project-row:not(.is-filtered-out)");
  const target = visibleProject || works;
  const topbarHeight = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
  const serviceNavHeight = document.querySelector(".mobile-service-nav")?.getBoundingClientRect().height || 0;
  const offset = topbarHeight + serviceNavHeight + 22;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior });
};

const getFilteredUrl = (filter) => {
  const normalizedFilter = filter === "architecture" || filter === "design" ? filter : "all";
  const base = `${window.location.pathname}`;

  if (normalizedFilter === "all") {
    return `${base}#works`;
  }

  return `${base}?filter=${normalizedFilter}#works`;
};

const applyProjectFilter = (filter, options = {}) => {
  if (!projectRows.length) {
    return;
  }

  const normalizedFilter = filter === "architecture" || filter === "design" ? filter : "all";

  projectRows.forEach((row) => {
    row.classList.remove("is-first-visible");
    row.classList.toggle("is-filtered-out", normalizedFilter !== "all" && row.dataset.category !== normalizedFilter);
  });

  const firstVisibleRow = Array.from(projectRows).find((row) => !row.classList.contains("is-filtered-out"));
  firstVisibleRow?.classList.add("is-first-visible");
  document.body.classList.toggle("is-project-filtered", normalizedFilter !== "all");

  let visibleIndex = 0;

  projectRows.forEach((row) => {
    const number = row.querySelector(".project-number");

    if (!number) {
      return;
    }

    number.dataset.fullNumber = number.dataset.fullNumber || number.textContent;

    if (normalizedFilter === "all" || row.classList.contains("is-filtered-out")) {
      number.textContent = number.dataset.fullNumber;
      return;
    }

    visibleIndex += 1;
    number.textContent = `0.${visibleIndex}`;
  });

  projectFilterLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.projectFilter === normalizedFilter);
  });

  if (options.updateUrl && window.history?.pushState) {
    window.history.pushState({ projectFilter: normalizedFilter }, "", getFilteredUrl(normalizedFilter));
  }
};

if (projectRows.length) {
  const initialFilter = new URLSearchParams(window.location.search).get("filter");
  applyProjectFilter(initialFilter);

  projectFilterLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyProjectFilter(link.dataset.projectFilter, { updateUrl: true });
      scrollToWorks();
    });
  });

  document.querySelector(".topbar .brand")?.addEventListener("click", (event) => {
    event.preventDefault();
    applyProjectFilter("all");

    if (window.history?.pushState) {
      const homePath = window.location.pathname.replace(/index\.html$/i, "") || "/";
      window.history.pushState({ projectFilter: "all" }, "", homePath);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("popstate", () => {
    applyProjectFilter(new URLSearchParams(window.location.search).get("filter"));
  });
}

const createContactOverlay = () => {
  const overlay = document.createElement("div");
  overlay.className = "clean-overlay contact-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="contact-overlay-stage" role="dialog" aria-modal="true" aria-label="Контакты">
      <div class="contact-overlay-brand clean-overlay-brand" aria-hidden="true">
        <span class="brand-word">ХАРА<span class="accent-mark" aria-hidden="true"></span></span>
      </div>
      <button class="contact-overlay-close clean-overlay-close" type="button" aria-label="Вернуться">Вернуться</button>
      <div class="contact-overlay-content">
        <div class="contact-actions" aria-label="Связаться">
          <a href="tel:+79281181850">Позвонить</a>
          <a href="https://wa.me/79281181850">WhatsApp</a>
          <a href="https://t.me/sergey_danilovv">Telegram</a>
        </div>
      </div>
    </div>
  `;

  document.body.append(overlay);
  return overlay;
};

const createConceptOverlay = () => {
  const servicesHref = `${window.location.pathname.includes("/projects/") ? "../" : ""}services.html`;
  const servicesLink = servicesPublished ? `<p class="concept-services"><a href="${servicesHref}">Услуги</a></p>` : "";
  const overlay = document.createElement("div");
  overlay.className = "clean-overlay concept-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="concept-overlay-stage" role="dialog" aria-modal="true" aria-label="Концепция">
      <div class="clean-overlay-brand" aria-hidden="true">
        <span class="brand-word">ХАРА<span class="accent-mark" aria-hidden="true"></span></span>
      </div>
      <button class="clean-overlay-close concept-overlay-close" type="button" aria-label="Вернуться">Вернуться</button>
      <div class="concept-overlay-content">
        <p>ХАРА́ | Архитектурная и дизайн-практика для частных домов, жилых интерьеров и камерных общественных пространств.</p>
        <p>В основе проекта - пропорция, ясная структура, свет и сдержанная материальность.</p>
        ${servicesLink}
      </div>
    </div>
  `;

  document.body.append(overlay);
  return overlay;
};

const contactOverlay = createContactOverlay();
const contactOverlayClose = contactOverlay.querySelector(".contact-overlay-close");
const conceptOverlay = createConceptOverlay();
const conceptOverlayClose = conceptOverlay.querySelector(".concept-overlay-close");
const buildMobileContactDock = () => {
  if (document.querySelector(".mobile-contact-dock")) {
    return;
  }

  const dock = document.createElement("button");
  dock.className = "mobile-contact-dock js-contact-trigger";
  dock.type = "button";
  dock.textContent = "Контакты";
  dock.setAttribute("aria-label", "Открыть контакты");
  document.body.append(dock);
};

buildMobileContactDock();
const contactTriggers = document.querySelectorAll(".js-contact-trigger");
const conceptTriggers = document.querySelectorAll('a[href="#practice"], a[href$="#practice"]');

const openContactOverlay = () => {
  contactOverlay.classList.add("is-open");
  contactOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeContactOverlay = () => {
  contactOverlay.classList.remove("is-open");
  contactOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const openConceptOverlay = () => {
  conceptOverlay.classList.add("is-open");
  conceptOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeConceptOverlay = () => {
  conceptOverlay.classList.remove("is-open");
  conceptOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

contactTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openContactOverlay();
  });
});

conceptTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openConceptOverlay();
  });
});

document.querySelectorAll('a[href^="tel:"]').forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    trigger.textContent = "8 928 118 18 50";
    trigger.classList.add("is-phone-visible");
  });
});

contactOverlayClose.addEventListener("click", closeContactOverlay);
contactOverlay.addEventListener("click", (event) => {
  if (!event.target.closest("a, button")) {
    closeContactOverlay();
  }
});
conceptOverlayClose.addEventListener("click", closeConceptOverlay);
conceptOverlay.addEventListener("click", (event) => {
  if (!event.target.closest("a, button")) {
    closeConceptOverlay();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (contactOverlay.classList.contains("is-open")) {
      closeContactOverlay();
    }

    if (conceptOverlay.classList.contains("is-open")) {
      closeConceptOverlay();
    }
  }
});

if (window.location.hash === "#contact") {
  openContactOverlay();
}

if (window.location.hash === "#practice") {
  openConceptOverlay();
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const topbar = document.querySelector(".topbar");
const infoBar = document.querySelector(".info-bar");
const projectGalleries = document.querySelectorAll(".project-gallery");
const lightboxGalleries = document.querySelectorAll(".project-gallery, .realization-gallery, .realization-gallery--single, .project-docs");
const draggableGalleries = document.querySelectorAll(".project-gallery, .realization-gallery, .realization-gallery--single");

const syncStickyHeights = () => {
  const root = document.documentElement;
  root.style.setProperty("--topbar-height", `${topbar?.offsetHeight || 0}px`);
  root.style.setProperty("--info-bar-height", `${infoBar?.offsetHeight || 0}px`);
};

let stickyHeightsFrame = null;

const queueStickyHeights = () => {
  if (stickyHeightsFrame !== null) {
    return;
  }

  stickyHeightsFrame = window.requestAnimationFrame(() => {
    stickyHeightsFrame = null;
    syncStickyHeights();
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, progress) => start + (end - start) * progress;
const easeScrollProgress = (progress) => progress * progress * (3 - 2 * progress);

const resetMobileTopbarVars = () => {
  if (!topbar) {
    return;
  }

  [
    "--topbar-progress",
    "--topbar-brand-size",
    "--topbar-brand-scale-x",
    "--topbar-brand-line-height",
    "--topbar-padding-top",
    "--topbar-padding-bottom",
    "--topbar-gap",
    "--topbar-bg-alpha",
  ].forEach((property) => topbar.style.removeProperty(property));
};

const syncTopbarState = () => {
  if (!topbar) {
    return;
  }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  if (!isMobile) {
    topbar.classList.toggle("is-compact", window.scrollY > 28);
    resetMobileTopbarVars();
    queueStickyHeights();
    return;
  }

  topbar.classList.toggle("is-compact", window.scrollY > 28);
  resetMobileTopbarVars();
  queueStickyHeights();
};

const classifyGalleryItems = () => {
  projectGalleries.forEach((gallery) => {
    gallery.querySelectorAll("figure").forEach((item) => {
      const image = item.querySelector("img");

      if (!image?.naturalWidth || !image?.naturalHeight) {
        return;
      }

      const ratio = image.naturalWidth / image.naturalHeight;
      item.classList.remove("gallery-item--landscape", "gallery-item--portrait", "gallery-item--square");

      if (ratio > 1.15) {
        item.classList.add("gallery-item--landscape");
      } else if (ratio < 0.9) {
        item.classList.add("gallery-item--portrait");
      } else {
        item.classList.add("gallery-item--square");
      }
    });
  });
};

const ensureGalleryShell = (gallery) => {
  if (gallery.classList.contains("project-gallery--single") || gallery.dataset.controlsReady === "true") {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "project-gallery-shell";

  const controls = document.createElement("div");
  controls.className = "project-gallery-controls";

  const prevButton = document.createElement("button");
  prevButton.className = "project-gallery-control";
  prevButton.type = "button";
  prevButton.textContent = "<";
  prevButton.setAttribute("aria-label", "Предыдущий рендер");

  const nextButton = document.createElement("button");
  nextButton.className = "project-gallery-control";
  nextButton.type = "button";
  nextButton.textContent = ">";
  nextButton.setAttribute("aria-label", "Следующий рендер");

  controls.append(prevButton, nextButton);
  gallery.parentNode.insertBefore(shell, gallery);
  shell.append(controls, gallery);

  const scrollStep = () => Math.max(gallery.clientWidth * 0.82, 320);

  prevButton.addEventListener("click", () => {
    gallery.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    gallery.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });

  const figures = Array.from(gallery.querySelectorAll("figure"));

  if (figures.length > 1) {
    const counter = document.createElement("p");
    counter.className = "project-gallery-counter";
    counter.setAttribute("aria-hidden", "true");
    shell.append(counter);

    const updateCounter = () => {
      let current = 0;
      let best = Infinity;

      figures.forEach((figure, index) => {
        const distance = Math.abs(figure.offsetLeft - gallery.offsetLeft - gallery.scrollLeft);

        if (distance < best) {
          best = distance;
          current = index;
        }
      });

      const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 4;
      counter.textContent = `${atEnd ? figures.length : current + 1} / ${figures.length}`;
    };

    gallery.addEventListener("scroll", () => window.requestAnimationFrame(updateCounter), { passive: true });
    window.addEventListener("resize", updateCounter);
    updateCounter();
  }

  gallery.dataset.controlsReady = "true";
};

const enableDragScroll = (gallery) => {
  if (gallery.dataset.dragReady === "true") {
    return;
  }

  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasMoved = false;

  gallery.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }

    isPointerDown = true;
    hasMoved = false;
    startX = event.clientX;
    startScrollLeft = gallery.scrollLeft;
    gallery.classList.add("is-dragging");
  });

  gallery.addEventListener("mousemove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const delta = event.clientX - startX;

    if (Math.abs(delta) > 6) {
      hasMoved = true;
      gallery.scrollLeft = startScrollLeft - delta;
    }
  });

  const stopDragging = () => {
    if (!isPointerDown) {
      return;
    }

    isPointerDown = false;
    gallery.classList.remove("is-dragging");

    if (hasMoved) {
      gallery.dataset.dragMoved = "true";
      window.setTimeout(() => {
        gallery.dataset.dragMoved = "false";
      }, 0);
    }
  };

  gallery.addEventListener("mouseup", stopDragging);
  gallery.addEventListener("mouseleave", stopDragging);
  gallery.addEventListener("dragstart", (event) => event.preventDefault());

  gallery.dataset.dragReady = "true";
};

const createLightbox = () => {
  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="gallery-lightbox-stage">
      <div class="gallery-lightbox-brand" aria-hidden="true">
        <span class="brand-word">ХАРА<span class="accent-mark" aria-hidden="true"></span></span>
      </div>
      <div class="gallery-lightbox-top">
        <button class="gallery-lightbox-button gallery-lightbox-close" type="button" aria-label="Закрыть">x</button>
      </div>
      <div class="gallery-lightbox-frame">
        <button class="gallery-lightbox-button gallery-lightbox-prev" type="button" aria-label="Предыдущий рендер"><</button>
        <img class="gallery-lightbox-image" alt="">
        <button class="gallery-lightbox-button gallery-lightbox-next" type="button" aria-label="Следующий рендер">></button>
      </div>
      <p class="gallery-lightbox-caption"></p>
    </div>
  `;

  document.body.append(lightbox);
  return lightbox;
};

const lightbox = createLightbox();
const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");
const lightboxClose = lightbox.querySelector(".gallery-lightbox-close");
const lightboxPrev = lightbox.querySelector(".gallery-lightbox-prev");
const lightboxNext = lightbox.querySelector(".gallery-lightbox-next");
const lightboxFrame = lightbox.querySelector(".gallery-lightbox-frame");

let activeGalleryItems = [];
let activeGalleryIndex = 0;
let lightboxPointerId = null;
let lightboxStartX = 0;
let lightboxStartY = 0;
let lightboxTouchId = null;
let lightboxTouchStartX = 0;
let lightboxTouchStartY = 0;

const renderLightboxItem = () => {
  const current = activeGalleryItems[activeGalleryIndex];

  if (!current) {
    return;
  }

  const image = current.querySelector("img");

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "";
  lightboxCaption.textContent = activeGalleryItems.length > 1 ? `${activeGalleryIndex + 1} / ${activeGalleryItems.length}` : "";
};

const openLightbox = (items, index, gallery) => {
  activeGalleryItems = items;
  activeGalleryIndex = index;
  lightbox.classList.toggle("is-plan-lightbox", gallery?.classList.contains("project-docs"));
  lightbox.classList.toggle("is-plan-single", items.length <= 1);
  renderLightboxItem();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const stepLightbox = (direction) => {
  if (!activeGalleryItems.length) {
    return;
  }

  activeGalleryIndex = (activeGalleryIndex + direction + activeGalleryItems.length) % activeGalleryItems.length;
  renderLightboxItem();
};

const stepLightboxFromSwipe = (deltaX, deltaY) => {
  if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
    return false;
  }

  stepLightbox(deltaX < 0 ? 1 : -1);
  return true;
};

const startLightboxSwipe = (event) => {
  if (!lightbox.classList.contains("is-open") || event.pointerType !== "pen") {
    return;
  }

  lightboxPointerId = event.pointerId;
  lightboxStartX = event.clientX;
  lightboxStartY = event.clientY;
  lightboxFrame.setPointerCapture?.(event.pointerId);
};

const finishLightboxSwipe = (event) => {
  if (lightboxPointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - lightboxStartX;
  const deltaY = event.clientY - lightboxStartY;
  lightboxPointerId = null;

  stepLightboxFromSwipe(deltaX, deltaY);
};

const startLightboxTouchSwipe = (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  const touch = event.changedTouches[0];

  if (!touch) {
    return;
  }

  lightboxTouchId = touch.identifier;
  lightboxTouchStartX = touch.clientX;
  lightboxTouchStartY = touch.clientY;
};

const finishLightboxTouchSwipe = (event) => {
  if (lightboxTouchId === null) {
    return;
  }

  const touch = Array.from(event.changedTouches).find((item) => item.identifier === lightboxTouchId);

  if (!touch) {
    return;
  }

  const deltaX = touch.clientX - lightboxTouchStartX;
  const deltaY = touch.clientY - lightboxTouchStartY;
  lightboxTouchId = null;

  if (stepLightboxFromSwipe(deltaX, deltaY)) {
    event.preventDefault();
  }
};

syncStickyHeights();
syncTopbarState();
classifyGalleryItems();
window.addEventListener("resize", syncStickyHeights);
window.addEventListener("resize", syncTopbarState);
window.addEventListener("resize", classifyGalleryItems);
window.addEventListener("load", syncStickyHeights);
window.addEventListener("load", syncTopbarState);
window.addEventListener("load", classifyGalleryItems);
window.addEventListener("scroll", syncTopbarState, { passive: true });

if (document.fonts?.ready) {
  document.fonts.ready.then(syncStickyHeights);
  document.fonts.ready.then(classifyGalleryItems);
}

projectGalleries.forEach((gallery) => {
  ensureGalleryShell(gallery);

  gallery.querySelectorAll("img").forEach((image) => {
    if (image.complete) {
      classifyGalleryItems();
      return;
    }

    image.addEventListener("load", classifyGalleryItems, { once: true });
  });
});

lightboxGalleries.forEach((gallery) => {
  const items = Array.from(gallery.querySelectorAll("figure"));

  items.forEach((item, index) => {
    item.tabIndex = 0;

    item.addEventListener("click", (event) => {
      if (gallery.dataset.dragMoved === "true") {
        event.preventDefault();
        gallery.dataset.dragMoved = "false";
        return;
      }

      openLightbox(items, index, gallery);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(items, index, gallery);
      }
    });
  });
});

draggableGalleries.forEach((gallery) => {
  enableDragScroll(gallery);
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => stepLightbox(-1));
lightboxNext.addEventListener("click", () => stepLightbox(1));
lightboxFrame.addEventListener("pointerdown", startLightboxSwipe);
lightboxFrame.addEventListener("pointerup", finishLightboxSwipe);
lightboxFrame.addEventListener("pointercancel", () => {
  lightboxPointerId = null;
});
lightboxFrame.addEventListener("touchstart", startLightboxTouchSwipe, { passive: true });
lightboxFrame.addEventListener("touchend", finishLightboxTouchSwipe);
lightboxFrame.addEventListener("touchcancel", () => {
  lightboxTouchId = null;
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (contactOverlay.classList.contains("is-open")) {
    if (event.key === "Escape") {
      closeContactOverlay();
    }

    return;
  }

  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    stepLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    stepLightbox(1);
  }
});
