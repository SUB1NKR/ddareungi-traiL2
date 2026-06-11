const loadingPage = document.querySelector("#loading");
const slides = document.querySelectorAll(".safety-slide");

const slideInterval = 3000;
const totalLoadingTime = slides.length * slideInterval;


let currentIndex = 0;

const slideTimer = setInterval(() => {
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
  }, 800);
}, totalLoadingTime);
