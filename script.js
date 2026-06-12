const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");
const loadingFill = document.querySelector("#loadingFill");

const gnb = document.querySelector("#gnb");
const menuButton = document.querySelector("#menuButton");
const menuPanel = document.querySelector("#menuPanel");

const scrollGuide = document.querySelector("#scrollGuide");

const frameCanvas = document.querySelector("#frameCanvas");
const frameContext = frameCanvas?.getContext("2d");

const slideInterval = 2000;
const totalLoadingTime = slides.length * slideInterval;
const menuDuration = 780;

const frameCount = 362;
const frameStartIndex = 0;
const framePath = "./assets/frames/";
const framePrefix = "BX사이트";
const frameExtension = ".webp";

const wheelSensitivity = 0.00065;
const keyStep = 0.025;
const touchSensitivity = 0.0016;

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;

let isGnbReady = false;
let isPageReady = false;
let isMenuOpen = false;
let isMenuClosing = false;

let frameImages = [];
let currentFrameIndex = 0;
let lastDrawnFrameIndex = 0;
let virtualProgress = 0;
let touchStartY = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shouldBlockInteraction() {
  return !isPageReady || isMenuOpen || isMenuClosing;
}

function getFrameSrc(index) {
  const frameNumber = String(frameStartIndex + index).padStart(3, "0");
  return `${framePath}${framePrefix}${frameNumber}${frameExtension}`;
}

function preloadFrames() {
  frameImages = Array.from({ length: frameCount }, (_, index) => {
    const image = new Image();
    image.src = getFrameSrc(index);
    return image;
  });

  frameImages[0].addEventListener("load", () => {
    resizeFrameCanvas();
    drawFrame(0);
  });
}

function resizeFrameCanvas() {
  if (!frameCanvas || !frameContext) return;

  const pixelRatio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  frameCanvas.width = width * pixelRatio;
  frameCanvas.height = height * pixelRatio;
  frameCanvas.style.width = `${width}px`;
  frameCanvas.style.height = `${height}px`;

  frameContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  drawFrame(lastDrawnFrameIndex);
}

function drawFrame(index) {
  if (!frameContext || !frameCanvas) return;

  const image = frameImages[index];

  if (!image || !image.complete || image.naturalWidth === 0) {
    const fallbackImage = frameImages[lastDrawnFrameIndex];

    if (fallbackImage && fallbackImage.complete && fallbackImage.naturalWidth > 0) {
      drawImageCover(fallbackImage);
    }

    return;
  }

  drawImageCover(image);
  lastDrawnFrameIndex = index;
}

function drawImageCover(image) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  frameContext.clearRect(0, 0, canvasWidth, canvasHeight);
  frameContext.fillStyle = "#ffffff";
  frameContext.fillRect(0, 0, canvasWidth, canvasHeight);
  frameContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function updateFrameByProgress() {
  const nextFrameIndex = Math.round(virtualProgress * (frameCount - 1));

  if (nextFrameIndex === currentFrameIndex) return;

  currentFrameIndex = nextFrameIndex;
  drawFrame(currentFrameIndex);
}

function updateVirtualProgress(delta) {
  virtualProgress = clamp(virtualProgress + delta, 0, 1);
  updateFrameByProgress();
  hideScrollGuide();
  restartScrollGuideTimer();
}

function handleWheel(event) {
  event.preventDefault();

  if (shouldBlockInteraction()) return;

  updateVirtualProgress(event.deltaY * wheelSensitivity);
}

function handleKeydown(event) {
  const nextKeys = ["ArrowDown", "PageDown", " "];
  const prevKeys = ["ArrowUp", "PageUp"];

  if (![...nextKeys, ...prevKeys, "Home", "End"].includes(event.key)) return;

  event.preventDefault();

  if (shouldBlockInteraction()) return;

  if (nextKeys.includes(event.key)) {
    updateVirtualProgress(keyStep);
  }

  if (prevKeys.includes(event.key)) {
    updateVirtualProgress(-keyStep);
  }

  if (event.key === "Home") {
    virtualProgress = 0;
    updateFrameByProgress();
  }

  if (event.key === "End") {
    virtualProgress = 1;
    updateFrameByProgress();
  }
}

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();

  if (shouldBlockInteraction()) return;

  const currentY = event.touches[0].clientY;
  const deltaY = touchStartY - currentY;

  touchStartY = currentY;

  updateVirtualProgress(deltaY * touchSensitivity);
}

function startFrameSequence() {
  preloadFrames();
  resizeFrameCanvas();
  drawFrame(0);

  window.addEventListener("resize", resizeFrameCanvas);
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

    startFrameSequence();
    showGnb();
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
    virtualProgress = 0;
    updateFrameByProgress();
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

menuButton?.addEventListener("click", toggleMenu);

document.querySelector("[data-home-link]")?.addEventListener("click", moveToHome);

startButton?.addEventListener("click", startLoading);
