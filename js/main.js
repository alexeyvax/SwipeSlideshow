/**
 * Create by alexeyvax 2016 <Alexey Vakhrushev alexeyvax1990@gmail.com>
 * 
 * @param containerSlideshow {HTMLElement}
 * @param animationTime {Number}
 */
function SwipeSlideshow( containerSlideshow, animationTime )
{
	/** Булиты для отображения и управления слайдером */
	let bookmarks;
	/** Выделенный слайд */
	let savedCurrentElement;
	/** Предыдущий слайд */
	let savedPrevElement;
	/** Следующий слайд */
	let savedNextElement;
	/** Выделенный букмарк */
	let savedBookmarkElement;
	/** Работает ли листание */
	let isMove = false;
	/** Позиция свайпа */
	let positionSwipe;
	/** Первый элемент из массива targetTouches */
	let itemTargetTouches;
	/** Координаты курсора */
	let shiftX;
	/** Кнопка назад */
	const prev = containerSlideshow.querySelector( 'div.controls > button.prev' );
	/** Кнопка вперёд */
	const next = containerSlideshow.querySelector( 'div.controls > button.next' );
	/** Контейнер со слайдами */
	const container = containerSlideshow.querySelector( 'ul.slides' );
	/** Коллекция слайдов */
	const elementCollection = Array.prototype.slice.call( container.querySelectorAll( 'li' ));
	/** Контейнер букмарков */
	const bookmarksContainer = containerSlideshow.querySelector( 'ul.bookmarks' );
	/** Индекс предыдущего слайда */
	let prevNumberSlide = elementCollection.length - 1;
	/** Индекс выделенного слайда */
	let currentNumberSlide = 0;
	/** Индекс следующего слайда */
	let nextNumberSlide = 1;
	/** Класс переключения предыдущего слайда */
	const GOING_TO_PREV = 'goingToPrev';
	/** Класс переключения следующего слайда */
	const GOING_TO_NEXT = 'goingToNext';
	/** Класс перетаскиваемого(движущегося) слайда */
	const DRAGGING = 'dragging';
	/** Класс следующего слайда */
	const NEXT = 'next';
	/** Класс предыдущего слайда */
	const PREV = 'prev';
	/** Класс выделенного слайда */
	const CURRENT = 'current';
	/** Класс возврата контейнера */
	const BACK = 'back';
	/** Минимальная величина для свайпа */
	const SIZE_REZET_SWIPE = 100;
	
	createBookmarks();
	
	const bookmarksCollection = Array.prototype.slice.call( 
		containerSlideshow.querySelectorAll( 'ul.bookmarks > li' ));
	
	initSlideshow();

	const arrayBookmarksCollection = containerSlideshow.querySelectorAll( 'ul.bookmarks > li' );
	
	next.addEventListener( 'click', nextSlide );
	prev.addEventListener( 'click', prevSlide );
	container.addEventListener( 'touchstart', startSwipe );
	container.addEventListener( 'mousedown', startSwipe );
	
	/**
	 * 
	 * 
	 * @param event {Event}
	 * @returns
	 */
	function startSwipe( event )
	{
		if ( container.classList.contains( DRAGGING ))
		{
			return;
		}
		
		if ( event.type === 'mousedown' )
		{
			shiftX = event.pageX;
			
			container.classList.add( DRAGGING );
			
			container.addEventListener( 'mousemove', moveSwipe );
			container.addEventListener( 'mouseup',endSwipe );
			document.addEventListener( 'mouseup', endSwipe );
		}
		else
		{
			if ( event.targetTouches.length === 1 )
			{
				container.classList.add( DRAGGING );
				
				itemTargetTouches = event.targetTouches[0].pageX;
				
				container.addEventListener( 'touchmove', moveSwipe );
				container.addEventListener( 'touchend', endSwipe );
			}
		}
	}
	
	/**
	 * 
	 * 
	 * @param event {Event}
	 */
	function moveSwipe( event )
	{
		if ( event.type === 'mousemove' )
		{
			positionSwipe = event.pageX - shiftX;
			
			container.style.left = -containerSlideshow.offsetWidth + positionSwipe + 'px';
		}
		else
		{
			if ( event.targetTouches.length === 1 )
			{
				positionSwipe = event.targetTouches[0].pageX - itemTargetTouches;
				container.style.left = -containerSlideshow.offsetWidth + positionSwipe + 'px';
			}
		}
	}
	
	/**
	 * 
	 * 
	 * @param event {Event}
	 */
	function endSwipe( event )
	{
		container.removeEventListener( 'mousemove', moveSwipe );
		container.removeEventListener( 'mouseup', endSwipe );
		document.removeEventListener( 'mouseup', endSwipe );
		container.removeEventListener( 'touchmove', moveSwipe );
		container.removeEventListener( 'touchend', endSwipe );
		
		setTimeout(
			() =>
			{
				container.classList.remove( DRAGGING );
			},
			animationTime
		);
		
		if ( positionSwipe > SIZE_REZET_SWIPE )
		{
			prevSlide();
			
			setTimeout(
				() =>
				{
					container.style.left = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe > 0
			&& positionSwipe <= SIZE_REZET_SWIPE )
		{
			container.classList.add( BACK );
			
			setTimeout(
				() =>
				{
					container.classList.remove( BACK );
					container.style.left = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe === 0 )
		{
			event.preventDefault();
			container.classList.remove( DRAGGING );
		}
		else if ( positionSwipe < -SIZE_REZET_SWIPE )
		{
			nextSlide();
			
			setTimeout(
				() =>
				{
					container.style.left = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe < 0
			&& positionSwipe >= -SIZE_REZET_SWIPE )
		{
			container.classList.add( BACK );
			
			setTimeout(
				() =>
				{
					container.classList.remove( BACK );
					container.style.left = '';
				},
				animationTime
			);
		}
		
		positionSwipe = 0;
	}
	
	container.ondragstart = () =>
	{
		return false;
	};
	
	/**
	 * 
	 */
	function initSlideshow()
	{
		savedCurrentElement = elementCollection[currentNumberSlide];
		savedCurrentElement.classList.add( CURRENT );
		
		savedPrevElement = elementCollection[prevNumberSlide];
		savedPrevElement.classList.add( PREV );
		
		savedNextElement = elementCollection[nextNumberSlide];
		savedNextElement.classList.add( NEXT );
		
		savedBookmarkElement = bookmarksCollection[currentNumberSlide];
		savedBookmarkElement.classList.add( CURRENT );
	}
	
	/**
	 * 
	 * 
	 * @returns
	 */
	function nextSlide()
	{
		if ( isMove )
		{
			return;
		}
		
		isMove = true;
		
		prevNumberSlide++;
		currentNumberSlide++;
		nextNumberSlide++;
		
		lastSlide();
		
		container.classList.add( GOING_TO_NEXT );
		
		setTimeout(
			() =>
			{
				removeClassCurrent();
				
				container.classList.remove( GOING_TO_NEXT );
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
		
	}
	
	/**
	 * 
	 * 
	 * @returns
	 */
	function lastSlide()
	{
		if ( currentNumberSlide >= 2
		&& elementCollection.length - 1 >  currentNumberSlide )
		{
			return;
		}
		
		if ( prevNumberSlide === elementCollection.length )
		{
			prevNumberSlide = 0;
		}
		
		if ( currentNumberSlide === elementCollection.length )
		{
			currentNumberSlide = 0;
		}
		
		if ( nextNumberSlide === elementCollection.length )
		{
			nextNumberSlide = 0;
		}
	}
	
	/**
	 * 
	 * 
	 * @returns
	 */
	function prevSlide()
	{
		if ( isMove )
		{
			return;
		}
		
		isMove = true;
		
		prevNumberSlide--;
		currentNumberSlide--;
		nextNumberSlide--;
		
		firstSlide();
		
		container.classList.add( GOING_TO_PREV );
		
		setTimeout(
			() =>
			{
				removeClassCurrent();
				
				container.classList.remove( GOING_TO_PREV );
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
	}
	
	/**
	 * 
	 * 
	 * @returns
	 */
	function firstSlide()
	{
		if ( currentNumberSlide >= 1
			&& elementCollection.length - 2 >  currentNumberSlide )
		{
			return;
		}
		
		if ( prevNumberSlide < 0 )
		{
			prevNumberSlide = elementCollection.length - 1;
		}
		
		if ( currentNumberSlide < 0 )
		{
			currentNumberSlide = elementCollection.length - 1;
		}
		
		if ( nextNumberSlide < 0 )
		{
			nextNumberSlide = elementCollection.length - 1;
		}
	}
	
	/**
	 * 
	 */
	function removeClassCurrent()
	{
		savedCurrentElement.classList.remove( CURRENT );
		savedPrevElement.classList.remove( PREV );
		savedNextElement.classList.remove( NEXT );
		savedBookmarkElement.classList.remove( CURRENT );
	}
	
	/**
	 * 
	 */
	function createBookmarks()
	{
		Array.prototype.forEach.call(
			elementCollection,
			() =>
			{
				bookmarks = document.createElement( 'li' );
				bookmarksContainer.appendChild( bookmarks );
			}
		);
		
		bookmarksContainer.addEventListener( 'click', ( event ) => clickBookmarks( event ));
	}
	
	function clickBookmarks( event )
	{
		const index = Array.prototype.indexOf.call(bookmarksContainer.children, event.target);
		
		if ( isMove
			|| index === currentNumberSlide )
		{
			return;
		}
		
		isMove = true;
		
		if ( currentNumberSlide < index )
		{
			nextNumberSlide = index;
			
			savedNextElement.classList.remove( NEXT );
			savedNextElement = elementCollection[nextNumberSlide];
			savedNextElement.classList.remove( PREV );
			savedNextElement.classList.add( NEXT );
			
			container.classList.add( GOING_TO_NEXT );
		}
		else
		{
			prevNumberSlide = index;
			
			savedPrevElement.classList.remove( PREV );
			savedPrevElement = elementCollection[prevNumberSlide];
			savedPrevElement.classList.add( PREV );
			
			container.classList.add( GOING_TO_PREV );
		}
		
		setTimeout(
			() =>
			{
				removeClassCurrent();
				
				currentNumberSlide = index;
				prevNumberSlide = currentNumberSlide - 1;
				nextNumberSlide = currentNumberSlide + 1;
				
				if ( currentNumberSlide === elementCollection.length - 1 )
				{
					nextNumberSlide = 0;
				}
				
				if ( currentNumberSlide === 0 )
				{
					prevNumberSlide = elementCollection.length - 1;
				}
				
				if ( container.classList.contains( GOING_TO_NEXT )
				|| container.classList.contains( GOING_TO_PREV ) )
				{
					container.classList.remove( GOING_TO_NEXT );
					container.classList.remove( GOING_TO_PREV );
				}
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
	}
}

const containerSlideshow = document.querySelector( 'div.slide-show' );
const animationTime = 500;

new SwipeSlideshow( containerSlideshow, animationTime );
