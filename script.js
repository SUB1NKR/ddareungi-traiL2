const adaptivePopup = document.querySelector("#adaptivePopup");
const startButton = document.querySelector("#startButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");

const slideInterval = 3000;
const totalLoadingTime = slides.length * slideInterval;

let currentIndex = 0;
let slideTimer = null;

function startLoading() {
  adaptivePopup.classList.add("is-hidden");

  setTimeout(() => {
    adaptivePopup.style.display = "none";

    loadingPage.classList.add("is-running");
    runSafetySlides();
  }, 600);
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

  setTimeout(() => {
    loadingPage.classList.add("is-hidden");

    setTimeout(() => {
      loadingPage.style.display = "none";
      document.body.style.overflow = "auto";
    }, 800);
  }, totalLoadingTime);
}

startButton.addEventListener("click", startLoading);
