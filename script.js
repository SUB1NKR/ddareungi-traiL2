const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");
const loadingFill = document.querySelector("#loadingFill");

const gnb = document.querySelector("#gnb");
const menuButton = document.querySelector("#menuButton");
const menuPanel = document.querySelector("#menuPanel");

const scrollGuide = document.querySelector("#scrollGuide");

const frameSection = document.querySelector("#frameSection");
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

let currentIndex = 0;
let slideTimer = null;
let scrollGuideTimer = null;
let lastScrollY = 0;

let isGnbReady = false;
let isPageReady = false;
let isMenuOpen = false;
let isMenuClosing = false;

let lockedScrollY = 0;
let isRestoringScroll = false;

let frameImages = [];
let currentFrameIndex = 0;
let frameAnimationId = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shouldBlockScroll() {
  return !isPageReady || isMenuOpen || isMenuClosing;
}

function saveLockedScrollPosition() {
  lockedScrollY = window.scrollY;
}

function preventScroll(event) {
  if (!shouldBlockScroll()) return;
  event.preventDefault();
}

function preventScrollKey(event) {
  if (!shouldBlockScroll()) return;

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

function restoreLockedScroll() {
  if (!shouldBlockScroll()) return;
  if (isRestoringScroll) return;
  if (window.scrollY === lockedScrollY) return;

  isRestoringScroll = true;

  window.scrollTo(0, lockedScrollY);

  requestAnimationFrame(() => {
    isRestoringScroll = false;
  });
}

function startScrollBlock() {
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("keydown", preventScrollKey);
  window.addEventListener("scroll", restoreLockedScroll);
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

  drawFrame(currentFrameIndex);
}

function drawFrame(index) {
  if (!frameContext || !frameCanvas) return;

  const image = frameImages[index];

  if (!image || !image.complete) return;

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
  frameContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function updateFrameByScroll() {
  if (!frameSection || !isPageReady) return;

  const sectionTop = frameSection.offsetTop;
  const sectionHeight = frameSection.offsetHeight;
  const viewportHeight = window.innerHeight;

  const scrollRange = sectionHeight - viewportHeight;
  const progress = clamp((window.scrollY - sectionTop) / scrollRange, 0, 1);
  const nextFrameIndex = Math.round(progress * (frameCount - 1));

  if (nextFrameIndex !== currentFrameIndex) {
    currentFrameIndex = nextFrameIndex;
    drawFrame(currentFrameIndex);
  }
}

function requestFrameUpdate() {
  if (frameAnimationId) return;

  frameAnimationId = requestAnimationFrame(() => {
    updateFrameByScroll();
    frameAnimationId = null;
  });
}

function startFrameSequence() {
  if (!frameSection || !frameCanvas || !frameContext) return;

  preloadFrames();
  resizeFrameCanvas();
  updateFrameByScroll();

  window.addEventListener("scroll", requestFrameUpdate);
  window.addEventListener("resize", () => {
    resizeFrameCanvas();
    requestFrameUpdate();
  });
}

function startLoading() {
  saveLockedScrollPosition();

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

  saveLockedScrollPosition();

  document.body.classList.add("is-menu-open");
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

  window.scrollTo(0, lockedScrollY);
  showGnb();

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

saveLockedScrollPosition();
startScrollBlock();

menuButton?.addEventListener("click", toggleMenu);

document.querySelector("[data-home-link]")?.addEventListener("click", moveToHome);

startButton?.addEventListener("click", startLoading);
