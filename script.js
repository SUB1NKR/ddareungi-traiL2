const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");

const loadingFill = document.querySelector("#loadingFill");
const loadingText = document.querySelector("#loadingText");

const scrollGuide = document.querySelector("#scrollGuide");

const slideInterval = 2000;
const totalLoadingTime = slides.length * slideInterval;

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;
let loadingDotTimer = null;
let loadingDotCount = 1;

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

    runLoadingText();
    runLoadingProgress();
    runSafetySlides();
  }, 600);
}

function runLoadingText() {
  loadingText.textContent = "Loading.";

  loadingDotTimer = setInterval(() => {
    loadingDotCount += 1;

    if (loadingDotCount > 3) {
      loadingDotCount = 1;
    }

    loadingText.textContent = `Loading${".".repeat(loadingDotCount)}`;
  }, 1000);
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
      clearInterval(loadingDotTimer);
      loadingText.textContent = "Loading...";

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

    showScrollGuide();
    startScrollGuideWatch();
  }, 800);
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
