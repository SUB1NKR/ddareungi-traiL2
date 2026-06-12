const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");
const loadingFill = document.querySelector("#loadingFill");

const gnb = document.querySelector("#gnb");
const menuButton = document.querySelector("#menuButton");
const menuPanel = document.querySelector("#menuPanel");

const scrollGuide = document.querySelector("#scrollGuide");
const frameImage = document.querySelector("#frameImage");

const slideInterval = 2000;
const totalLoadingTime = slides.length * slideInterval;
const menuDuration = 780;

const frameCount = 362;
const frameStartIndex = 0;
const framePath = "./assets/frames/";
const framePrefix = "BX사이트";
const frameExtension = ".webp";

const wheelSensitivity = 0.00012;
const maxWheelDelta = 0.006;
const keyStep = 0.006;
const touchSensitivity = 0.00035;

let currentSlideIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;

let isPageReady = false;
let isMenuOpen = false;
let isMenuClosing = false;

let progress = 0;
let currentFrameIndex = -1;
let touchStartY = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shouldBlockFrameControl() {
  return !isPageReady || isMenuOpen || isMenuClosing;
}

function getFrameSrc(index) {
  const frameNumber = String(frameStartIndex + index).padStart(3, "0");
  return `${framePath}${framePrefix}${frameNumber}${frameExtension}`;
}

function preloadFrames() {
  for (let index = 0; index < frameCount; index += 1) {
    const image = new Image();
    image.src = getFrameSrc(index);
  }
}

function setFrame(index) {
  if (!frameImage) return;

  const safeIndex = clamp(index, 0, frameCount - 1);

  if (safeIndex === currentFrameIndex) return;

  currentFrameIndex = safeIndex;
  frameImage.src = getFrameSrc(currentFrameIndex);
}

function updateFrame() {
  const nextFrameIndex = Math.round(progress * (frameCount - 1));
  setFrame(nextFrameIndex);
}

function changeProgress(delta) {
  progress = clamp(progress + delta, 0, 1);
  updateFrame();

  hideScrollGuide();
  restartScrollGuideTimer();
}

function handleWheel(event) {
  event.preventDefault();

  if (shouldBlockFrameControl()) return;

  const rawDelta = event.deltaY * wheelSensitivity;
  const limitedDelta = clamp(rawDelta, -maxWheelDelta, maxWheelDelta);

  changeProgress(limitedDelta);
}

function handleKeydown(event) {
  const nextKeys = ["ArrowDown", "PageDown", " "];
  const prevKeys = ["ArrowUp", "PageUp"];
  const controlKeys = [...nextKeys, ...prevKeys, "Home", "End"];

  if (!controlKeys.includes(event.key)) return;

  event.preventDefault();

  if (shouldBlockFrameControl()) return;

  if (nextKeys.includes(event.key)) {
    changeProgress(keyStep);
  }

  if (prevKeys.includes(event.key)) {
    changeProgress(-keyStep);
  }

  if (event.key === "Home") {
    progress = 0;
    updateFrame();
  }

  if (event.key === "End") {
    progress = 1;
    updateFrame();
  }

  hideScrollGuide();
  restartScrollGuideTimer();
}

function handleTouchStart(event) {
  if (!event.touches || event.touches.length === 0) return;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();

  if (shouldBlockFrameControl()) return;
  if (!event.touches || event.touches.length === 0) return;

  const currentY = event.touches[0].clientY;
  const deltaY = touchStartY - currentY;

  touchStartY = currentY;

  changeProgress(deltaY * touchSensitivity);
}

function startFrameSequence() {
  if (!frameImage) return;

  setFrame(0);
  preloadFrames();

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("touchstart", handleTouchStart, { passive: false });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
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
    if (currentSlideIndex >= slides.length - 1) {
      clearInterval(slideTimer);
      return;
    }

    slides[currentSlideIndex].classList.remove("active");
    currentSlideIndex += 1;
    slides[currentSlideIndex].classList.add("active");
  }, slideInterval);
}

function finishLoading() {
  loadingPage.classList.add("is-hidden");

  setTimeout(() => {
    loadingPage.style.display = "none";
    isPageReady = true;

    startFrameSequence();
    showGnb();
    showScrollGuide();
    startScrollGuideWatch();
  }, 800);
}

function showGnb() {
  if (!gnb) return;

  gnb.classList.remove("is-hidden");

  requestAnimationFrame(() => {
    gnb.classList.add("is-visible");
  });
}

function openMenu() {
  if (!menuButton || !menuPanel || isMenuClosing) return;

  isMenuOpen = true;
  isMenuClosing = false;

  document.body.classList.add("is-menu-open");
  document.body.classList.remove("is-menu-closing");

  menuPanel.classList.remove("is-closing");
  menuPanel.classList.add("is-open");

  menuButton.classList.add("is-open");
  menuButton.setAttribute("aria-label", "메뉴 닫기");

  hideScrollGuide();
}

function closeMenu(callback) {
  if (!menuButton || !menuPanel || !isMenuOpen || isMenuClosing) return;

  isMenuOpen = false;
  isMenuClosing = true;

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

  document.body.classList.remove("is-menu-closing");

  showGnb();

  if (typeof callback === "function") {
    callback();
  }
}

function toggleMenu() {
  isMenuOpen ? closeMenu() : openMenu();
}

function moveToHome(event) {
  event.preventDefault();

  closeMenu(() => {
    progress = 0;
    updateFrame();
    showScrollGuide();
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

function restartScrollGuideTimer() {
  clearTimeout(scrollGuideTimer);
  scrollGuideTimer = setTimeout(showScrollGuide, 5000);
}

function startScrollGuideWatch() {
  restartScrollGuideTimer();
}

window.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("keydown", handleKeydown);
window.addEventListener("touchstart", handleTouchStart, { passive: false });
window.addEventListener("touchmove", handleTouchMove, { passive: false });

menuButton?.addEventListener("click", toggleMenu);

document.querySelector("[data-home-link]")?.addEventListener("click", moveToHome);

startButton?.addEventListener("click", startLoading);
