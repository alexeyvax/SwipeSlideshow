/**
 * Create by alexeyvax 2015 <Alexey Vakhrushev alexeyvax1990@gmail.com>
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
	const elementCollection = container.children;
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
	
	initCssVariables();
	createBookmarks();
	initCounter();
	
	const bookmarksCollection = bookmarksContainer.children;
	
	initSlideshow();
	
	const boundDocumentStartSwipeHandler = ( event ) => startSwipe( event );
	const boundDocumentMoveSwipeHandler = ( event ) => moveSwipe( event );
	const boundDocumentEndSwipeHandler = ( event ) => endSwipe( event );
	const unRegisterHandlers = () =>
	{
		container.removeEventListener( 'mousemove', boundDocumentMoveSwipeHandler );
		container.removeEventListener( 'mouseup', boundDocumentEndSwipeHandler );
		document.removeEventListener( 'mouseup', boundDocumentEndSwipeHandler );
		container.removeEventListener( 'touchmove', boundDocumentMoveSwipeHandler );
		container.removeEventListener( 'touchend', boundDocumentEndSwipeHandler );
	};
	
	next.addEventListener( 'click', () => nextSlide() );
	prev.addEventListener( 'click', () => prevSlide() );
	container.addEventListener( 'touchstart', boundDocumentStartSwipeHandler );
	container.addEventListener( 'mousedown', boundDocumentStartSwipeHandler );
	
	/**
	 * Начало свайпа, захват слайда
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
			
			addClass( container, DRAGGING );
			
			container.addEventListener( 'mousemove', boundDocumentMoveSwipeHandler );
			container.addEventListener( 'mouseup',boundDocumentEndSwipeHandler );
			document.addEventListener( 'mouseup', boundDocumentEndSwipeHandler );
		}
		else
		{
			if ( event.targetTouches.length === 1 )
			{
				addClass( container, DRAGGING );
				
				itemTargetTouches = event.targetTouches[0].pageX;
				
				container.addEventListener( 'touchmove', boundDocumentMoveSwipeHandler );
				container.addEventListener( 'touchend', boundDocumentEndSwipeHandler );
			}
		}
	}
	
	/**
	 * Движение слайда
	 * 
	 * @param event {Event}
	 */
	function moveSwipe( event )
	{
		if ( event.type === 'mousemove' )
		{
			positionSwipe = event.pageX - shiftX;
			
			container.style.transform = `
				translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
			`;
		}
		else
		{
			if ( event.targetTouches.length === 1 )
			{
				positionSwipe = event.targetTouches[0].pageX - itemTargetTouches;
				container.style.transform = `
					translate(${-containerSlideshow.offsetWidth + positionSwipe}px, 0)
				`;
			}
		}
	}
	
	/**
	 * Завершение движения(перетаскивания)
	 * 
	 * @param event {Event}
	 */
	function endSwipe( event )
	{
		unRegisterHandlers();
		
		setTimeout(
			() =>
			{
				removeClass( container, DRAGGING );
			},
			animationTime
		);
		
		if ( positionSwipe > SIZE_REZET_SWIPE )
		{
			prevSlide();
			
			setTimeout(
				() =>
				{
					container.style.transform = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe > 0
			&& positionSwipe <= SIZE_REZET_SWIPE )
		{
			addClass( container, BACK );
			
			setTimeout(
				() =>
				{
					removeClass( container, BACK );
					container.style.transform = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe === 0 )
		{
			event.preventDefault();
			removeClass( container, DRAGGING );
		}
		else if ( positionSwipe < -SIZE_REZET_SWIPE )
		{
			nextSlide();
			
			setTimeout(
				() =>
				{
					container.style.transform = '';
				},
				animationTime
			);
		}
		else if ( positionSwipe < 0
			&& positionSwipe >= -SIZE_REZET_SWIPE )
		{
			addClass( container, BACK );
			
			setTimeout(
				() =>
				{
					removeClass( container, BACK );
					container.style.transform = '';
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
	 * Инициализация слайдера
	 */
	function initSlideshow()
	{
		savedCurrentElement = elementCollection[currentNumberSlide];
		addClass( savedCurrentElement, CURRENT );
		
		savedPrevElement = elementCollection[prevNumberSlide];
		addClass( savedPrevElement, PREV );
		
		savedNextElement = elementCollection[nextNumberSlide];
		addClass( savedNextElement, NEXT );
		
		savedBookmarkElement = bookmarksCollection[currentNumberSlide];
		addClass( savedBookmarkElement, CURRENT );
		
		containerSlideshow.dispatchEvent(
			new CustomEvent(
				'change:slide',
				{
					detail: true
				}
			)
		);
	}
	
	/**
	 * Переход на следующий слайд
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
		
		addClass( container, GOING_TO_NEXT );
		
		setTimeout(
			() =>
			{
				removeClassCurrent();
				
				removeClass( container, GOING_TO_NEXT );
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
	}
	
	/**
	 * Обработка зацикливания слайдера после последнего слайда
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
	 * Переход на предыдущий слайд
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
		
		addClass( container, GOING_TO_PREV );
		
		setTimeout(
			() =>
			{
				removeClassCurrent();
				
				removeClass( container, GOING_TO_PREV );
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
	}
	
	/**
	 * Обработка зацикливания слайдера после первого слайда
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
	 * Удаление классов со всех лишек
	 */
	function removeClassCurrent()
	{
		removeClass( savedCurrentElement, CURRENT );
		removeClass( savedPrevElement, PREV );
		removeClass( savedNextElement, NEXT );
		removeClass( savedBookmarkElement, CURRENT );
	}
	
	/**
	 * Создание букмарков(точек навигации)
	 */
	function createBookmarks()
	{
		const docFragment = document.createDocumentFragment();
		
		Array.prototype.forEach.call(
			elementCollection,
			() =>
			{
				bookmark = document.createElement( 'li' );
				docFragment.appendChild( bookmark );
			}
		);
		
		bookmarksContainer.appendChild( docFragment );
		bookmarksContainer.addEventListener( 'click', ( event ) => clickBookmarks( event ));
	}
	
	/**
	 * Обработка клика по букмаркам(точкам навигации)
	 * 
	 * @param event
	 * @returns
	 */
	function clickBookmarks( event )
	{
		const index = Array.prototype.indexOf.call( bookmarksContainer.children, event.target );
		
		if ( isMove
			|| index === currentNumberSlide )
		{
			return;
		}
		
		isMove = true;
		
		if ( currentNumberSlide < index )
		{
			nextNumberSlide = index;
			
			removeClass( savedNextElement, NEXT );
			savedNextElement = elementCollection[nextNumberSlide];
			removeClass( savedNextElement, PREV );
			addClass( savedNextElement, NEXT );
			
			addClass( container, GOING_TO_NEXT );
		}
		else
		{
			prevNumberSlide = index;
			
			removeClass( savedPrevElement, PREV );
			savedPrevElement = elementCollection[prevNumberSlide];
			removeClass( savedNextElement, NEXT );
			addClass( savedPrevElement, PREV );
			
			addClass( container, GOING_TO_PREV );
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
				|| container.classList.contains( GOING_TO_PREV ))
				{
					removeClass( container, GOING_TO_NEXT, GOING_TO_PREV );
				}
				
				initSlideshow();
				isMove = false;
			},
			animationTime
		);
	}
	
	function initCounter()
	{
		const counter = containerSlideshow.querySelector( 'div.counter' );
		
		if ( !counter )
		{
			return;
		}
		
		const listCounters = createCounter( counter );
		
		listCounters[0].textContent = currentNumberSlide + 1;
		listCounters[1].textContent = elementCollection.length;
		
		containerSlideshow.addEventListener(
			'change:slide', () => updateCurrentCount( listCounters[0] )
		);
	}
	
	function updateCurrentCount( currentCount )
	{
		currentCount.textContent = currentNumberSlide + 1;
	}
	
	function createCounter( container )
	{
		const currentCount = document.createElement( 'span' );
		const allCounts = document.createElement( 'span' );
		addClass( currentCount, 'current-count' );
		addClass( allCounts, 'all-counts' );
		
		container.appendChild( currentCount );
		container.appendChild( allCounts );
		
		return [currentCount, allCounts];
	}
	
	/**
	 * Назначаю тайминг css переменной
	 */
	function initCssVariables()
	{
		document.documentElement.style.setProperty( '--animationTime', `${animationTime}ms` );
	}
}

/** Добавление классов
 *  @param element {HTMLElement}
 * 	@param className {string}
 */
function addClass( element, className )
{
	if ( !element )
	{
		return;
	}
	
	for( let i = 1; i < arguments.length; i++ )
	{
		element.classList.add( arguments[i] );
	}
}

/** Удаление классов
 *  @param element {HTMLElement}
 * 	@param className {string}
 */
function removeClass( element, className )
{
	if ( !element )
	{
		return;
	}
	
	for( let i = 1; i < arguments.length; i++ )
	{
		element.classList.remove( arguments[i] );
	}
}

const containerSlideshow = document.querySelector( 'div.slide-show' );
const animationTime = 500;

new SwipeSlideshow( containerSlideshow, animationTime );
