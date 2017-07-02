/**
 * Create by alexeyvax 2015 <Alexey Vakhrushev alexeyvax1990@gmail.com>
*/
function SwipeSlideshow(containerSlideshow, animationTime) {
  /** controls(points navigation) */
  let bookmarks;
  let savedCurrentElement;
  let savedPrevElement;
  let savedNextElement;
  let savedBookmarkElement;
  let isMoveActive = false;
  let positionSwipe;
  /** first element in array targetTouches */
  let itemTargetTouches;
  /** cursor coordinates */
  let shiftX;
  const buttonPrev = containerSlideshow.querySelector('div.controls > button.prev');
  const buttonNext = containerSlideshow.querySelector('div.controls > button.next');
  const slidesContainer = containerSlideshow.querySelector('ul.slides');
  const slidesCollection = slidesContainer.children;
  const bookmarksContainer = containerSlideshow.querySelector('ul.bookmarks');
  let prevNumberSlide = slidesCollection.length - 1;
  let currentNumberSlide = 0;
  let nextNumberSlide = 1;
  const GOING_TO_PREV = 'goingToPrev';
  const GOING_TO_NEXT = 'goingToNext';
  /* moving slide */
  const DRAGGING = 'dragging';
  const CLASS_NEXT = 'next';
  const CLASS_PREV = 'prev';
  const CLASS_CURRENT = 'current';
  const CLASS_BACK = 'back';
  /* min size for swipe */
  const SIZE_REZET_SWIPE = 100;
  
  initCssVariables();
  createBookmarks();
  initCounter();
  
  const bookmarksCollection = bookmarksContainer.children;
  
  initSlideshow();
  
  const boundDocumentStartSwipeHandler = event => startSwipe(event);
  const boundDocumentMoveSwipeHandler = event => moveSwipe(event);
  const boundDocumentEndSwipeHandler = event => endSwipe(event);
  const unRegisterHandlers = () => {
    slidesContainer.removeEventListener('mousemove', boundDocumentMoveSwipeHandler);
    slidesContainer.removeEventListener('mouseup', boundDocumentEndSwipeHandler);
    document.removeEventListener('mouseup', boundDocumentEndSwipeHandler);
    slidesContainer.removeEventListener('touchmove', boundDocumentMoveSwipeHandler);
    slidesContainer.removeEventListener('touchend', boundDocumentEndSwipeHandler);
  };
  
  buttonNext.addEventListener('click', () => nextSlide());
  buttonPrev.addEventListener('click', () => prevSlide());
  slidesContainer.addEventListener('touchstart', boundDocumentStartSwipeHandler);
  slidesContainer.addEventListener('mousedown', boundDocumentStartSwipeHandler);
  
  /* Swipe start */
  function startSwipe(event) {
    if (slidesContainer.classList.contains(DRAGGING)) {
      return;
    }
    
    if (event.type === 'mousedown') {
      shiftX = event.pageX;
      addClasses(slidesContainer, DRAGGING);
      
      slidesContainer.addEventListener('mousemove', boundDocumentMoveSwipeHandler);
      slidesContainer.addEventListener('mouseup',boundDocumentEndSwipeHandler);
      document.addEventListener('mouseup', boundDocumentEndSwipeHandler);
    } else {
      if (event.targetTouches.length === 1) {
        addClasses(slidesContainer, DRAGGING);
        itemTargetTouches = event.targetTouches[0].pageX;
        
        slidesContainer.addEventListener('touchmove', boundDocumentMoveSwipeHandler);
        slidesContainer.addEventListener('touchend', boundDocumentEndSwipeHandler);
      }
    }
  }
  
  /* Move slide */
  function moveSwipe(event) {
    if (event.type === 'mousemove') {
      positionSwipe = event.pageX - shiftX;
      slidesContainer.style.transform = `
        translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
      `;
    } else {
      if (event.targetTouches.length === 1) {
        positionSwipe = event.targetTouches[0].pageX - itemTargetTouches;
        slidesContainer.style.transform = `
          translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
        `;
      }
    }
  }
  
  /* Ending swipe */
  function endSwipe(event) {
    unRegisterHandlers();
    setTimeout(
      () => removeClasses(slidesContainer, DRAGGING),
      animationTime,
    );
    
    if (positionSwipe > SIZE_REZET_SWIPE) {
      prevSlide();
      setTimeout(
        () => slidesContainer.style.transform = '',
        animationTime,
      );
    } else if (positionSwipe > 0
      && positionSwipe <= SIZE_REZET_SWIPE) {
      addClasses(slidesContainer, CLASS_BACK);
      setTimeout(() => {
        removeClasses(slidesContainer, CLASS_BACK);
        slidesContainer.style.transform = '';
      }, animationTime);
    } else if (positionSwipe === 0) {
      event.preventDefault();
      removeClasses(slidesContainer, DRAGGING);
    } else if (positionSwipe < -SIZE_REZET_SWIPE) {
      nextSlide();
      setTimeout(
        () => slidesContainer.style.transform = '',
        animationTime,
      );
    } else if (positionSwipe < 0
      && positionSwipe >= -SIZE_REZET_SWIPE) {
      addClasses(slidesContainer, CLASS_BACK);
      setTimeout(() => {
        removeClasses(slidesContainer, CLASS_BACK);
        slidesContainer.style.transform = '';
      }, animationTime);
    }
    positionSwipe = 0;
  }
  slidesContainer.ondragstart = () => false;
  
  /* Initialization slideshow */
  function initSlideshow() {
    savedCurrentElement = slidesCollection[currentNumberSlide];
    addClasses(savedCurrentElement, CLASS_CURRENT);
    
    savedPrevElement = slidesCollection[prevNumberSlide];
    addClasses(savedPrevElement, CLASS_PREV);
    
    savedNextElement = slidesCollection[nextNumberSlide];
    addClasses(savedNextElement, CLASS_NEXT);
    
    savedBookmarkElement = bookmarksCollection[currentNumberSlide];
    addClasses(savedBookmarkElement, CLASS_CURRENT);
    
    containerSlideshow.dispatchEvent(
      new CustomEvent('change:slide', { detail: true }));
  }
  
  /* Go to next slide */
  function nextSlide() {
    if (isMoveActive){
      return;
    }
    isMoveActive = true;
    
    prevNumberSlide++;
    currentNumberSlide++;
    nextNumberSlide++;
    
    lastSlide();
    addClasses(slidesContainer, GOING_TO_NEXT);
    
    setTimeout(() => {
      removeClassCurrent();
      removeClasses(slidesContainer, GOING_TO_NEXT);
      initSlideshow();
      isMoveActive = false;
    }, animationTime);
  }
  
  /* slider is infinite after the last slide */
  function lastSlide() {
    if (currentNumberSlide >= 2
      && slidesCollection.length - 1 > currentNumberSlide) {
      return;
    }
    if (prevNumberSlide === slidesCollection.length) {
      prevNumberSlide = 0;
    }
    if (currentNumberSlide === slidesCollection.length) {
      currentNumberSlide = 0;
    }
    if (nextNumberSlide === slidesCollection.length) {
      nextNumberSlide = 0;
    }
  }
  
  /* Go to prev slide */
  function prevSlide() {
    if (isMoveActive) {
      return;
    }
    isMoveActive = true;
    
    prevNumberSlide--;
    currentNumberSlide--;
    nextNumberSlide--;
    
    firstSlide();
    addClasses(slidesContainer, GOING_TO_PREV);
    
    setTimeout(() => {
      removeClassCurrent();
      removeClasses(slidesContainer, GOING_TO_PREV);
      initSlideshow();
      isMoveActive = false;
    }, animationTime);
  }
  
  /* slider is infinite after the first slide */
  function firstSlide() {
    if (currentNumberSlide >= 1
      && slidesCollection.length - 2 > currentNumberSlide) {
      return;
    }
    if (prevNumberSlide < 0) {
      prevNumberSlide = slidesCollection.length - 1;
    }
    if (currentNumberSlide < 0) {
      currentNumberSlide = slidesCollection.length - 1;
    }
    if (nextNumberSlide < 0) {
      nextNumberSlide = slidesCollection.length - 1;
    }
  }
  
  /* Remove classes from all li */
  function removeClassCurrent() {
    removeClasses(savedCurrentElement, CLASS_CURRENT);
    removeClasses(savedPrevElement, CLASS_PREV);
    removeClasses(savedNextElement, CLASS_NEXT);
    removeClasses(savedBookmarkElement, CLASS_CURRENT);
  }
  
  /* Create bookmarks(navigation points) */
  function createBookmarks() {
    const docFragment = document.createDocumentFragment();
    Array.prototype.forEach.call(
      slidesCollection,
      () => {
        innerElement = document.createElement('input');
        innerElement.type = 'radio';
        bookmark = document.createElement('li');
        bookmark.appendChild(innerElement);
        docFragment.appendChild(bookmark);
      }
    );
    bookmarksContainer.appendChild(docFragment);
    bookmarksContainer.addEventListener('click', event => clickBookmarks(event));
  }
  
  /* Handle click for bookmarks(navigation points) */
  function clickBookmarks(event) {
    const index = Array.prototype.indexOf.call(bookmarksContainer.children, event.target);
    if (isMoveActive
      || index === currentNumberSlide
      || index === -1) {
      return;
    }
    isMoveActive = true;
    
    if (currentNumberSlide < index) {
      nextNumberSlide = index;
      removeClasses(savedNextElement, CLASS_NEXT);
      savedNextElement = slidesCollection[nextNumberSlide];
      removeClasses(savedNextElement, CLASS_PREV);
      addClasses(savedNextElement, CLASS_NEXT);
      addClasses(slidesContainer, GOING_TO_NEXT);
    } else {
      prevNumberSlide = index;
      removeClasses(savedPrevElement, CLASS_PREV);
      savedPrevElement = slidesCollection[prevNumberSlide];
      removeClasses(savedNextElement, CLASS_NEXT);
      addClasses(savedPrevElement, CLASS_PREV);
      addClasses(slidesContainer, GOING_TO_PREV);
    }
    
    setTimeout(() => {
      removeClassCurrent();
      currentNumberSlide = index;
      prevNumberSlide = currentNumberSlide - 1;
      nextNumberSlide = currentNumberSlide + 1;
      if (currentNumberSlide === slidesCollection.length - 1) {
        nextNumberSlide = 0;
      }
      if (currentNumberSlide === 0) {
        prevNumberSlide = slidesCollection.length - 1;
      }
      if (slidesContainer.classList.contains(GOING_TO_NEXT)
      || slidesContainer.classList.contains(GOING_TO_PREV)) {
        removeClasses(slidesContainer, GOING_TO_NEXT, GOING_TO_PREV);
      }
      
      initSlideshow();
      isMoveActive = false;
    }, animationTime);
  }

  function initCounter() {
    const counter = containerSlideshow.querySelector('div.counter');
    if (!counter) {
      return;
    }
    const listCounters = createCounter(counter);
    listCounters[0].textContent = currentNumberSlide + 1;
    listCounters[1].textContent = slidesCollection.length;
    containerSlideshow.addEventListener(
      'change:slide', () => updateCurrentCount(listCounters[0]));
  }

  function updateCurrentCount(currentCount) {
    currentCount.textContent = currentNumberSlide + 1;
  }

  function createCounter(container) {
    const currentCount = document.createElement('span');
    const allCounts = document.createElement('span');
    addClasses(currentCount, 'current-count');
    addClasses(allCounts, 'all-counts');
    container.appendChild(currentCount);
    container.appendChild(allCounts);
    return [currentCount, allCounts];
  }
  
  /* Set timing for css variables */
  function initCssVariables() {
    document.documentElement.style.setProperty('--animationTime', `${animationTime}ms`);
  }
}

/* Add some classes */
function addClasses(element, className) {
  if (!element) {
    return;
  }
  for(let i = 1; i < arguments.length; i++) {
    element.classList.add(arguments[i]);
  }
}
/* Remove some classes */
function removeClasses(element, className) {
  if (!element) {
    return;
  }
  for(let i = 1; i < arguments.length; i++) {
    element.classList.remove(arguments[i]);
  }
}

const listSlideshow = document.querySelectorAll('div.slide-show');
const animationTime = 1000;

Array.prototype.forEach.call(
  listSlideshow,
  slideshow => new SwipeSlideshow(slideshow, animationTime),
);
