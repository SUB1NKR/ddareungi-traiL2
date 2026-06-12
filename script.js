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

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;
let lastScrollY = 0;
let isGnbReady = false;
let isMenuOpen = false;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
    document.body.style.overflow = "auto";

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
  if (!gnb || !isGnbReady || isMenuOpen) return;

  gnb.classList.remove("is-visible");
  gnb.classList.add("is-hidden");
}

function startGnbScrollWatch() {
  lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    if (isMenuOpen) return;

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
  if (!menuButton || !menuPanel) return;

  isMenuOpen = true;
  document.body.classList.add("is-menu-open");
  menuPanel.classList.add("is-open");
  menuButton.classList.add("is-open");
  menuButton.setAttribute("aria-label", "메뉴 닫기");

  showGnb();
  hideScrollGuide();
}

function closeMenu() {
  if (!menuButton || !menuPanel) return;

  isMenuOpen = false;
  document.body.classList.remove("is-menu-open");
  menuPanel.classList.remove("is-open");
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-label", "메뉴 열기");
}

function toggleMenu() {
  isMenuOpen ? closeMenu() : openMenu();
}

function showScrollGuide() {
  if (!scrollGuide || isMenuOpen) return;
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

menuButton?.addEventListener("click", toggleMenu);

menuPanel?.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

startButton?.addEventListener("click", startLoading);
