const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");

const loadingFill = document.querySelector("#loadingFill");

const gnb = document.querySelector("#gnb");
const scrollGuide = document.querySelector("#scrollGuide");

const slideInterval = 2000;
const totalLoadingTime = slides.length * slideInterval;

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;

let lastScrollY = 0;
let isGnbReady = false;

function easeInOutCubic(t) {
  if (t < 0.5) {
    return 4 * t * t * t;
  }

  return 1 - Math.pow(-2 * t + 2, 3) / 2;
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
    const elapsedTime = currentTime - startTime;
    const rawProgress = Math.min(elapsedTime / totalLoadingTime, 1);
    const easedProgress = easeInOutCubic(rawProgress);

    loadingFill.style.width = `${easedProgress * 100}%`;

    if (rawProgress < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      loadingFill.style.width = "100%";
      finishLoading();
    }
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
  if (!gnb || !isGnbReady) return;

  gnb.classList.remove("is-visible");
  gnb.classList.add("is-hidden");
}

function startGnbScrollWatch() {
  lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const scrollDifference = Math.abs(currentScrollY - lastScrollY);

    if (scrollDifference < 8) return;

    if (currentScrollY <= 10) {
      showGnb();
    } else if (currentScrollY > lastScrollY) {
      hideGnb();
    } else {
      showGnb();
    }

    lastScrollY = currentScrollY;
  });
}

function showScrollGuide() {
  if (!scrollGuide) return;

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

    scrollGuideTimer = setTimeout(() => {
      showScrollGuide();
    }, 5000);
  });
}

startButton.addEventListener("click", startLoading);
