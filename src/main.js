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
  
  initCssVariables(animationTime);
  createBookmarks();
  initCounter();
  
  const bookmarksCollection = bookmarksContainer.children;
  
  initSlideshow();
  
  const boundDocumentStartSwipeHandler = e => startSwipe(e);
  const boundDocumentMoveSwipeHandler = e => moveSwipe(e);
  const boundDocumentEndSwipeHandler = e => endSwipe(e);
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
  function startSwipe(e) {
    if (slidesContainer.classList.contains(DRAGGING)) {
      return;
    }
    
    if (e.type === 'mousedown') {
      shiftX = e.pageX;
      addClasses(slidesContainer, DRAGGING);
      
      slidesContainer.addEventListener('mousemove', boundDocumentMoveSwipeHandler);
      slidesContainer.addEventListener('mouseup',boundDocumentEndSwipeHandler);
      document.addEventListener('mouseup', boundDocumentEndSwipeHandler);
    } else {
      if (e.targetTouches.length === 1) {
        addClasses(slidesContainer, DRAGGING);
        itemTargetTouches = e.targetTouches[0].pageX;
        
        slidesContainer.addEventListener('touchmove', boundDocumentMoveSwipeHandler);
        slidesContainer.addEventListener('touchend', boundDocumentEndSwipeHandler);
      }
    }
  }
  
  /* Move slide */
  function moveSwipe(e) {
    if (e.type === 'mousemove') {
      positionSwipe = e.pageX - shiftX;
      slidesContainer.style.transform = `
        translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
      `;
    } else {
      if (e.targetTouches.length === 1) {
        positionSwipe = e.targetTouches[0].pageX - itemTargetTouches;
        slidesContainer.style.transform = `
          translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
        `;
      }
    }
  }
  
  /* Ending swipe */
  function endSwipe(e) {
    unRegisterHandlers();
    setTimeout(() => removeClasses(slidesContainer, DRAGGING), animationTime);
    
    switch (true) {
      case positionSwipe > SIZE_REZET_SWIPE:
        prevSlide();
        setTimeout(() => slidesContainer.style.transform = '', animationTime);
        break;
      case positionSwipe > 0
        && positionSwipe <= SIZE_REZET_SWIPE:
        addClasses(slidesContainer, CLASS_BACK);
        setTimeout(() => {
          removeClasses(slidesContainer, CLASS_BACK);
          slidesContainer.style.transform = '';
        }, animationTime);
        break;
      case positionSwipe === 0:
        removeClasses(slidesContainer, DRAGGING);
        break;
      case positionSwipe < -SIZE_REZET_SWIPE:
        nextSlide();
        setTimeout(() => slidesContainer.style.transform = '', animationTime);
        break;
      case positionSwipe < 0
        && positionSwipe >= -SIZE_REZET_SWIPE:
        addClasses(slidesContainer, CLASS_BACK);
        setTimeout(() => {
          removeClasses(slidesContainer, CLASS_BACK);
          slidesContainer.style.transform = '';
        }, animationTime);
        break;
      default: removeClasses(slidesContainer, DRAGGING);
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
    
    containerSlideshow.dispatchEvent(new CustomEvent('change:slide', { detail: true }));
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
    switch (true) {
      case currentNumberSlide >= 2
        && slidesCollection.length - 1 > currentNumberSlide:
        return;
      case prevNumberSlide === slidesCollection.length:
        return prevNumberSlide = 0;
      case currentNumberSlide === slidesCollection.length:
        return currentNumberSlide = 0;
      case nextNumberSlide === slidesCollection.length:
        return nextNumberSlide = 0;
      default: return;
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
    switch (true) {
      case currentNumberSlide >= 1
        && slidesCollection.length - 2 > currentNumberSlide:
        return;
      case prevNumberSlide < 0:
        return prevNumberSlide = slidesCollection.length - 1;
      case currentNumberSlide < 0:
        return currentNumberSlide = slidesCollection.length - 1;
      case nextNumberSlide < 0:
        return nextNumberSlide = slidesCollection.length - 1;
      default: return;
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
    bookmarksContainer.addEventListener('click', e => clickBookmarks(e));
  }
  
  /* Handle click for bookmarks(navigation points) */
  function clickBookmarks(e) {
    const index = Array.prototype.indexOf.call(bookmarksContainer.children, e.target);
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
      } else if (currentNumberSlide === 0) {
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
      'change:slide',
      () => listCounters[0].textContent = currentNumberSlide + 1);
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
}

/* Set timing for css variables */
function initCssVariables(animationTime) {
  document.documentElement.style.setProperty('--animationTime', `${animationTime}ms`);
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
/* set animation time */
const animationTime = 500;

Array.prototype.forEach.call(
  listSlideshow,
  slideshow => new SwipeSlideshow(slideshow, animationTime),
);
