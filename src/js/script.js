function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function(){
  let slider = document.querySelector('.slider');

  if (slider) {
    let dotsWrapper = slider.querySelector('.slider__dots');
    let slides = [];
    for (let i = 0; i < slider.children.length; i++) {
      if (hasClass(slider.children[i], 'slider__slide')) {
        slides.push(slider.children[i]);
      }
    }

    let dots = slider.querySelector('.slider__dots').children;
    let activeSlideID = 0;
    let activeDot = dots[activeSlideID];
    let activeSlide = slides[activeSlideID];

    activeDot.classList.add('slider__dot--active');
    setInterval(() => {
      activeDot.classList.remove('slider__dot--active');
      activeSlide.classList.remove('slider__slide--active');
      if (activeDot.nextElementSibling) {
        activeSlideID++;
      } else {
        activeSlideID = 0;
      }
      activeDot = dots[activeSlideID];
      activeDot.classList.add('slider__dot--active');
      activeSlide = slides[activeSlideID];
      activeSlide.classList.add('slider__slide--active');
    }, 5000);

    dotsWrapper.addEventListener('click', (event) => {
      if (hasClass(event.target, 'slider__dot')) {
        if (!hasClass(event.target, 'slider__dot--active')) {
          activeDot.classList.remove('slider__dot--active');
          slides[activeSlideID].classList.remove('slider__slide--active');

          activeSlideID = getElementNumber(event.target);

          event.target.classList.add('slider__dot--active');
          activeDot = event.target;
          activeSlide = slides[activeSlideID];
          activeSlide.classList.add('slider__slide--active');
        }
      }
    });

    // Переключаем слайды, кликая по стрелочкам
    let arrows = slider.querySelector('.slider__arrows-wrapper');

    arrows.addEventListener('click', (event) => {
      activeDot.classList.remove('slider__dot--active');
      slides[activeSlideID].classList.remove('slider__slide--active');

      if (hasClass(event.target, 'slider__arrow-btn--prev')) {
        activeSlideID = (activeSlideID === 0) ? slides.length - 1 : --activeSlideID;
      } else if (hasClass(event.target, 'slider__arrow-btn--next')) {
        activeSlideID = (activeSlideID === slides.length - 1) ? 0 : ++activeSlideID;
      }

      activeDot = dots[activeSlideID];
      activeSlide = slides[activeSlideID];
      activeDot.classList.add('slider__dot--active');
      activeSlide.classList.add('slider__slide--active');
    });
  }
});

// Проверяет, есть ли класс у элемента
function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') !== -1;
}

// Возвращает число, показывающее каким по счету дочерним элементом является переданный DOM элемент
function getElementNumber(element) {
  let number = 0;
  while(element = element.previousElementSibling) {
    number++;
  }

  return number;
}
