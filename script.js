const adaptiveNotice = document.querySelector("#adaptiveNotice");
const noticeStartButton = document.querySelector("#noticeStartButton");

const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");

const slideInterval = 3000;
const totalLoadingTime = slides.length * slideInterval;

let currentIndex = 0;
let slideTimer = null;

function startLoading() {
  adaptiveNotice.classList.add("is-hidden");

  setTimeout(() => {
    adaptiveNotice.style.display = "none";
    loadingPage.classList.add("is-active");
    runSafetySlides();
  }, 600);
}

function runSafetySlides() {
  slideTimer = setInterval(() => {
    slides[currentIndex].classList.remove("active");

    currentIndex += 1;

    if (currentIndex >= slides.length) {
      clearInterval(slideTimer);
      return;
    }

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

noticeStartButton.addEventListener("click", startLoading);
