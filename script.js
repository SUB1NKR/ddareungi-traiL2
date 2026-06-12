const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");
const loadingFill = document.querySelector("#loadingFill");

const gnb = document.querySelector("#gnb");
const menuButton = document.querySelector("#menuButton");
const menuPanel = document.querySelector("#menuPanel");

const scrollGuide = document.querySelector("#scrollGuide");

const slideInterval = 2000;
const totalLoadingTime = slides.length * slideInterval;
const menuDuration = 780;

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;
let lastScrollY = 0;

let isGnbReady = false;
let isMenuOpen = false;
let isMenuClosing = false;
let isPageReady = false;
let scrollPosition = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function preventScroll(event) {
  if (isPageReady && !isMenuOpen && !isMenuClosing) return;
  event.preventDefault();
}

function preventScrollKey(event) {
  if (isPageReady && !isMenuOpen && !isMenuClosing) return;

  const scrollKeys = [
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " "
  ];

  if (scrollKeys.includes(event.key)) {
    event.preventDefault();
  }
}

function startGlobalScrollBlock() {
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("keydown", preventScrollKey);
}

function stopGlobalScrollBlock() {
  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);
  window.removeEventListener("keydown", preventScrollKey);
}

function lockMenuScroll() {
  scrollPosition = window.scrollY;

  document.documentElement.classList.add("is-menu-open");
  document.body.classList.add("is-menu-open");

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockMenuScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  document.documentElement.classList.remove("is-menu-open");
  document.documentElement.classList.remove("is-menu-closing");
  document.body.classList.remove("is-menu-open");
  document.body.classList.remove("is-menu-closing");

  window.scrollTo(0, scrollPosition);
}

function startLoading() {
  adaptivePopup.classList.add("is-hidden");

  setTimeout(() => {
    adaptivePopup.style.display = "none";
    loadingPage.classList.add("is-running");

    runLoadingProgress();
    runSafetySlides();
  }, 600);
}

function runLoadingProgress() {
  const startTime = performance.now();

  function updateProgress(currentTime) {
    const elapsed = currentTime - startTime;
    const rawProgress = Math.min(elapsed / totalLoadingTime, 1);
    const easedProgress = easeInOutCubic(rawProgress);

    loadingFill.style.width = `${easedProgress * 100}%`;

    if (rawProgress < 1) {
      requestAnimationFrame(updateProgress);
      return;
    }

    loadingFill.style.width = "100%";
    finishLoading();
  }

  requestAnimationFrame(updateProgress);
}

function runSafetySlides() {
  slideTimer = setInterval(() => {
    if (currentIndex >= slides.length - 1) {
      clearInterval(slideTimer);
      return;
    }

    slides[currentIndex].classList.remove("active");
    currentIndex += 1;
    slides[currentIndex].classList.add("active");
  }, slideInterval);
}

function finishLoading() {
  loadingPage.classList.add("is-hidden");

  setTimeout(() => {
    loadingPage.style.display = "none";

    isPageReady = true;

    document.documentElement.classList.add("is-page-ready");
    document.body.classList.add("is-page-ready");

    showGnb();
    startGnbScrollWatch();

    showScrollGuide();
    startScrollGuideWatch();
  }, 800);
}

function showGnb() {
  if (!gnb) return;

  isGnbReady = true;
  gnb.classList.remove("is-hidden");

  requestAnimationFrame(() => {
    gnb.classList.add("is-visible");
  });
}

function hideGnb() {
  if (!gnb || !isGnbReady || isMenuOpen || isMenuClosing) return;

  gnb.classList.remove("is-visible");
  gnb.classList.add("is-hidden");
}

function startGnbScrollWatch() {
  lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    if (isMenuOpen || isMenuClosing) return;

    const currentScrollY = window.scrollY;

    if (Math.abs(currentScrollY - lastScrollY) < 8) return;

    if (currentScrollY <= 10 || currentScrollY < lastScrollY) {
      showGnb();
    } else {
      hideGnb();
    }

    lastScrollY = currentScrollY;
  });
}

function openMenu() {
  if (!menuButton || !menuPanel || isMenuClosing) return;

  isMenuOpen = true;
  isMenuClosing = false;

  lockMenuScroll();
  startGlobalScrollBlock();

  document.documentElement.classList.remove("is-menu-closing");
  document.body.classList.remove("is-menu-closing");

  menuPanel.classList.remove("is-closing");
  menuPanel.classList.add("is-open");

  menuButton.classList.add("is-open");
  menuButton.setAttribute("aria-label", "메뉴 닫기");

  showGnb();
  hideScrollGuide();
}

function closeMenu(callback) {
  if (!menuButton || !menuPanel || !isMenuOpen || isMenuClosing) return;

  isMenuOpen = false;
  isMenuClosing = true;

  document.documentElement.classList.remove("is-menu-open");
  document.documentElement.classList.add("is-menu-closing");

  document.body.classList.remove("is-menu-open");
  document.body.classList.add("is-menu-closing");

  menuPanel.classList.remove("is-open");
  menuPanel.classList.add("is-closing");

  setTimeout(() => {
    finishCloseMenu(callback);
  }, menuDuration);
}

function finishCloseMenu(callback) {
  isMenuClosing = false;

  menuPanel.classList.remove("is-closing");

  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-label", "메뉴 열기");

  unlockMenuScroll();
  showGnb();

  if (isPageReady) {
    stopGlobalScrollBlock();
  }

  if (typeof callback === "function") {
    callback();
  }
}

function toggleMenu() {
  if (isMenuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function moveToHome(event) {
  event.preventDefault();

  closeMenu(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

function showScrollGuide() {
  if (!scrollGuide || isMenuOpen || isMenuClosing) return;
  scrollGuide.classList.add("is-visible");
}

function hideScrollGuide() {
  if (!scrollGuide) return;
  scrollGuide.classList.remove("is-visible");
}

function startScrollGuideWatch() {
  window.addEventListener("scroll", () => {
    hideScrollGuide();
    clearTimeout(scrollGuideTimer);

    scrollGuideTimer = setTimeout(showScrollGuide, 5000);
  });
}

startGlobalScrollBlock();

menuButton?.addEventListener("click", toggleMenu);

document.querySelector("[data-home-link]")?.addEventListener("click", moveToHome);

startButton?.addEventListener("click", startLoading);
