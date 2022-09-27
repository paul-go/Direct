
namespace Player
{
	/** */
	export class Purview<THat extends Hot.HatLike = Hot.HatLike>
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.sizeClasses = generateSizeClasses();
			
			const transitionClass = Hot.css({
				transitionDuration: "0.33s",
				transitionTimingFunction: "ease-in-out",
			});
			
			document.body.style.overflowX = "hidden";
			
			this.head = Hot.div(
				"purview",
				Hot.on(window, "scroll", () => this.updatePreviews()),
				Hot.on(document.body, "keydown", ev => this.handleKeyDown(ev)),
				this.scalerElement = Hot.div(
					"scaler",
					transitionClass,
					{
						transitionProperty: "transform",
						transformOrigin: "0 0",
					},
					this.previewsContainer = Hot.div(
						Class.previewsContainer,
						{
							position: "absolute",
							left: 0,
							top: 0,
							right: 0,
							height: 0,
						},
						Hot.css(" > DIV", {
							display: "none",
							position: "absolute",
							contain: "all",
							overflow: "hidden",
							width: "100vw",
							height: "100vh",
						})
					),
					this.reviewContainer = Hot.div(
						"review-container",
						transitionClass,
						Hot.css({
							display: "none",
							position: "absolute",
							left: 0,
							top: 0,
							right: 0,
							opacity: 0,
							width: "100vw",
							height: "100vh",
							transitionProperty: "opacity",
						}),
					)
				)
			);
			
			this.size = 4;
			Resize.watch(this.head, () => this.updatePreviews());
			[this.enterReviewFn, this._enterReviewFn] = Force.create<() => void>();
			[this.exitReviewFn, this._exitReviewFn] = Force.create<() => void>();
			
			this.beginOffsetTopTracking();
		}
		
		private readonly scalerElement;
		private readonly previewsContainer;
		private readonly reviewContainer;
		
		/** */
		readonly enterReviewFn;
		private readonly _enterReviewFn;
		
		/** */
		readonly exitReviewFn;
		private readonly _exitReviewFn;
		
		/**
		 * Gets or sets whether the size of the purview can be
		 * changed with keyboard control.
		 */
		enableKeyboardSizing = true;
		
		/** */
		private handleKeyDown(ev: KeyboardEvent)
		{
			if (ev.metaKey || ev.ctrlKey)
			{
				if (this.enableKeyboardSizing)
				{
					if (ev.key === "=")
						this.size--;
					
					else if (ev.key === "-")
						this.size++;
					
					else return;
					
					ev.preventDefault();
				}
			}
			else if (ev.key === "Escape")
			{
				if (this.mode === PurviewMode.review)
					this.gotoPreviews();
			}
		}
		
		/** */
		get mode()
		{
			return this._mode;
		}
		private _mode = PurviewMode.none;
		
		//# Preview Related
		
		/** */
		get prependedPreviewCount()
		{
			const e = this.previewsContainer.firstElementChild;
			if (!e)
				return 0;
			
			const index = getIndex(e);
			return index < 0 ? Math.abs(index) : 0;
		}
		
		/** */
		get appendedPreviewCount()
		{
			const e = this.previewsContainer.lastElementChild;
			return e ? getIndex(e) : 0;
		}
		
		/** */
		get totalPreviewCount()
		{
			return this.prependedPreviewCount + this.appendedPreviewCount;
		}
		
		/** */
		get size()
		{
			return this._size;
		}
		set size(size: number)
		{
			size = Math.max(minSize, Math.min(size, maxSize));
			if (size === this._size)
				return;
			
			const expanding = size > this._size;
			const unset = this._size < 0;
			this._size = size;
			
			const updateClass = () =>
			{
				const cls = this.sizeClasses.get(size);
				if (cls)
				{
					const se = this.scalerElement;
					se.classList.remove(...this.sizeClasses.values());
					se.classList.add(cls);
				}
				
				this.updatePreviews();
			}
			
			const animate = async () =>
			{
				await new Promise<void>(r => setTimeout(r, 10));
				this.setScalerTransform(0);
				await waitTransitionEnd(this.scalerElement);
			}
			
			if (unset)
			{
				updateClass();
				this.toggleScalerTransitions(false);
				this.setScalerTransform(0);
				this.toggleScalerTransitions(true);
			}
			else if (expanding)
			{
				updateClass();
				animate();
			}
			else
			{
				animate().then(() => updateClass());
			}
		}
		private _size = -1;
		
		private readonly sizeClasses: ReadonlyMap<number, string>;
		
		/** */
		async gotoPreviews()
		{
			if (this._mode === PurviewMode.preview)
				return;
			
			if (this.mode === PurviewMode.review)
				return void await this.exitReviewWithAnimation();
			
			this.populatePreviews("below");
		}
		
		/** */
		handlePreviewRequest(fn: GetPreviewFn<THat>)
		{
			this.previewRequestFn = fn;
		}
		private previewRequestFn?: GetPreviewFn<THat>;
		
		/** */
		private async requestPreview(rr: IReviewRequestInfo)
		{
			const requestedCount = rr.rangeEnd - rr.rangeStart;
			const promises = await this.previewRequestFn?.(rr) || [];
			return {
				promises,
				terminate: promises.length < requestedCount,
			};
		}
		
		/** */
		private async populatePreviews(where: "above" | "below", screens: number = 3)
		{
			const above = where === "above";
			const mul = above ? -1 : 1;
			const pullCount = this.size * this.size * screens;
			const rangeStart = this.prependedPreviewCount * mul || 0;
			const rangeEnd = rangeStart + (pullCount * mul);
			
			const itemRequest = await this.requestPreview({
				cacheOnly: false,
				rangeStart,
				rangeEnd,
			});
			
			const elements: HTMLElement[] = [];
			
			for (const maybePromise of itemRequest.promises)
			{
				if (maybePromise instanceof Promise)
				{
					const shim = Hot.div("element-placeholder");
					elements.push(shim);
					
					maybePromise.then(hat =>
					{
						for (const n of shim.getAttributeNames())
							if (n !== "style" && n !== "class")
								hat.head.setAttribute(n, shim.getAttribute(n) || "");
						
						for (const definedProperty of Array.from(shim.style))
						{
							hat.head.style.setProperty(
								definedProperty,
								shim.style.getPropertyValue(definedProperty));
						}
						
						Hot.get(hat.head)(
							// Classes that have been set on the shim since it was inserted
							// must be copied over to the element.
							Array.from(shim.classList), 
							Hot.on("pointerdown", () => this.gotoReview(hat))
						);
						
						shim.replaceWith(hat.head);
					});
				}
				else
				{
					const hat = maybePromise;
					
					Hot.get(hat.head)(
						Hot.on("pointerdown", () => this.gotoReview(hat))
					);
					
					elements.push(hat.head);
				}
			}
			
			if (above)
			{
				const count = this.prependedPreviewCount;
				const len = elements.length;
				for (let i = -1; ++i < len;)
					setIndex(elements[i], -(count + len + i + 1));
				
				// This thing needs to change the window.scrollY
				//this.origin.prepend(...elements);
				//this.prependedObjectCount += elements.length;
			}
			else
			{
				for (let i = -1; ++i < elements.length;)
					setIndex(elements[i], this.appendedPreviewCount + i + 1);
				
				this.previewsContainer.append(...elements);
			}
			
			const { isNearingTop, isNearingBottom } = this.updatePreviews();
			
			if (!itemRequest.terminate)
			{
				if (isNearingBottom)
					this.populatePreviews("below", 1);
				
				if (0 && isNearingTop)
					this.populatePreviews("above", 1);
			}
		}
		
		/** */
		private updatePreviews()
		{
			block:
			{
				if (this.totalPreviewCount === 0)
					break block;
				
				const y = window.scrollY - this.offsetTop;
				const wh = window.innerHeight;
				const rowHeight = wh / this.size;
				const rowCount = this.totalPreviewCount / this.size;
				const visibleRowStart = Math.floor(y / rowHeight);
				const visibleItemStart = visibleRowStart * this.size;
				const visibleItemEnd = visibleItemStart + this.size * (this.size + 2);
				const elementsWithTop = new Set(getByClass(Class.hasTop, this.previewsContainer));
				const elementsVisible = new Set(getByClass(showClass, this.previewsContainer));
				
				for (let i = visibleItemStart; i < visibleItemEnd; i++)
				{
					const children = this.previewsContainer.children;
					const e = children.item(i);
					if (!(e instanceof HTMLElement))
					{
						if (i >= children.length)
							break;
						
						continue;
					}
					
					const mul = getIndex(e) > 0 ? 1 : -1;
					e.style.top = (100 * this.rowOf(e) * mul || 0).toFixed(5) + "vh";
					e.classList.add(Class.hasTop, showClass);
					
					elementsWithTop.delete(e);
					elementsVisible.delete(e);
				}
				
				for (const e of elementsWithTop)
				{
					e.style.removeProperty("top");
					e.classList.remove(Class.hasTop);
				}
				
				for (const e of elementsVisible)
					e.classList.remove(showClass);
				
				this.head.style.height = (100 * rowCount / this.size).toFixed(5) + "vh";
				this.scalerElement.style.height = (100 * rowCount).toFixed(5) + "vh";
				
				if (y === this.lastScrollY)
					break block;
				
				this.lastScrollY = y;
				
				return {
					isNearingTop: y < rowHeight,
					isNearingBottom: (y + wh) > (rowCount - 1) * (wh / this.size),
				};
			}
			
			return {
				isNearingTop: false,
				isNearingBottom: false,
			};
		}
		
		private lastScrollY = -1;
		
		/** */
		private columnOf(previewElement: Element)
		{
			const idx = getIndex(previewElement);
			if (idx < 0)
				throw "Not implemented";
			
			return (idx - 1) % this.size;
		}
		
		/** */
		private rowOf(previewElement: Element)
		{
			const eIdx = getIndex(previewElement);
			const rowIndex = Math.floor((eIdx - 1) / this.size);
			return rowIndex;
		}
		
		//# Review Related
		
		/**
		 * Gets a reference to the Scenery class being used
		 * to display the current review.
		 */
		get currentScenery()
		{
			return this._currentScenery;
		}
		private _currentScenery: Scenery | null = null;
		
		/**
		 * Gets a reference to the object that was specified
		 * as the preview object for the current item in review.
		 */
		get currentPreview()
		{
			return this._currentPreview;
		}
		private _currentPreview: THat | null = null;
		
		/** */
		private setScalerTransform(progress: number)
		{
			this.scalerElement.style.transform =
				`translateX(${(this.scalerTranslateX * progress).toFixed(4)}%) ` +
				`translateY(${this.scalerTranslateY * progress}vh) ` +
				`scale(${within(1 / this.size, 1, progress)})`;
		}
		
		/** */
		private get scalerTranslateX()
		{
			if (this._scalerTranslateX === minInt)
				this.recomputeTranslate();
			
			return this._scalerTranslateX;
		}
		private _scalerTranslateX = minInt;
		
		/** */
		private get scalerTranslateY()
		{
			if (this._scalerTranslateX === minInt)
				this.recomputeTranslate();
			
			return this._scalerTranslateY;
		}
		private _scalerTranslateY = minInt;
		
		/** */
		private recomputeTranslate()
		{
			if (!this._currentPreview)
				return;
			
			const col = this.columnOf(this._currentPreview.head);
			const row = this.rowOf(this._currentPreview.head);
			const wh = window.innerHeight;
			const scrollYinVh = (window.scrollY - this.offsetTop) / wh * 100;
			this._scalerTranslateX = -100 / this.size * col;
			this._scalerTranslateY = -100 * row + scrollYinVh;
		}
		
		/** */
		private toggleScalerTransitions(enabled: boolean)
		{
			if (enabled)
			{
				this.scalerElement.style.removeProperty("transition-duration");
				this.reviewContainer.style.removeProperty("transition-duration");
			}
			else
			{
				this.scalerElement.style.transitionDuration = "0s";
				this.reviewContainer.style.transitionDuration = "0s";
			}
		}
		
		/** */
		async gotoReview(previewHat: THat)
		{
			if (this._mode === PurviewMode.review)
				return;
			
			const requestResult = await this.reviewRequestFn?.(previewHat);
			if (!requestResult)
				return;
			
			this._enterReviewFn();
			
			const scenery = requestResult instanceof Scenery ?
				requestResult :
				new Scenery().insert(requestResult);
			
			// Make sure the first visible frame is shown (not the exitUpElement)
			const sectionFirst = scenery.getScene(0);
			const sectionLast = scenery.getScene(-1);
			
			const exitHeight = 60;
			const exitHeightRatio = exitHeight / 100;
			const exitStyles: Hot.Style = {
				height: exitHeight + "vh",
				zIndex: -2,
			};
			
			const exitUpElement = Hot.div("exit-up", exitStyles);
			const exitDownElement = Hot.div("exit-down", exitStyles);
			scenery.insert(0, exitUpElement);
			scenery.insert(exitDownElement);
			
			this._currentScenery = scenery;
			this._currentPreview = previewHat;
			this._mode = PurviewMode.review;
			this.reviewContainer.replaceChildren(scenery.head);
			
			this.setScalerTransform(1);
			
			Hot.get(scenery)({
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			});
			
			Hot.get(this.reviewContainer)({
				display: "block",
				left: Math.abs(this.scalerTranslateX) + "%",
				top: (100 * this.rowOf(previewHat.head)) + "vh",
				opacity: 0,
			});
			
			await new Promise(r => setTimeout(r));
			scenery.head.scrollTo({ top: sectionFirst.anchor.offsetTop });
			this.reviewContainer.style.opacity = "1";
			await waitTransitionEnd(this.reviewContainer);
			this.toggleScalerTransitions(false);
			
			scenery.addScrollComputer(state =>
			{
				if (state.element === sectionFirst.element)
					if (state.elementTopRatio >= 0 && state.elementTopRatio <= exitHeightRatio)
						return 0;
				
				if (state.element === sectionLast.element)
					if (state.elementBottomRatio <= 1)
						return Math.max(window.innerHeight - state.elementHeight, state.elementTop);
			});
			
			scenery.addScrollListener(states =>
			{
				const state = states.find(s => 
					s.element === exitUpElement || 
					s.element === exitDownElement);
				
				let mul = 1;
				if (state)
				{
					const tr = state.elementTopRatio;
					const hr = state.elementHeightRatio;
					
					if (state.element === exitUpElement)
						mul = 1 - ((tr + hr) / hr);
					
					else if (state.element === exitDownElement)
						mul = (tr - (1 - hr)) / hr;
				}
				
				this.setScalerTransform(mul);
				this.reviewContainer.style.opacity = mul.toString();
				
				// Actually exit
				if (mul < 0.005)
					this.exitReview();
			});
			
			this._mode = PurviewMode.review;
		}
		
		/** */
		private async exitReviewWithAnimation()
		{
			this.toggleScalerTransitions(true);
			this.setScalerTransform(0);
			this.reviewContainer.style.opacity = "0";
			await waitTransitionEnd(this.reviewContainer);
			this.exitReview();
		}
		
		/** */
		private exitReview()
		{
			this._currentScenery = null;
			this._mode = PurviewMode.preview;
			this._scalerTranslateX = minInt;
			this._scalerTranslateY = minInt;
			this.scalerElement.style.removeProperty("transition-duration");
			this.reviewContainer.replaceChildren();
			
			for (const property of Array.from(this.reviewContainer.style))
				this.reviewContainer.style.removeProperty(property);
			
			this._exitReviewFn();
		}
		
		/** */
		handleReviewRequest(fn: GetReviewFn<THat>)
		{
			this.reviewRequestFn = fn;
		}
		private reviewRequestFn?: GetReviewFn<THat>;
		
		/** */
		private beginOffsetTopTracking()
		{
			const mo = new MutationObserver(() => this._offsetTop = minInt);
			mo.observe(this.head, { childList: true, subtree: true, attributes: true });
			When.disconnected(this.head, () => mo.disconnect());
		}
		
		/** */
		private get offsetTop()
		{
			if (this._offsetTop === minInt)
			{
				if (this.scrollingAncestor === null)
				{
					this.scrollingAncestor = document.documentElement;
					const ancestors = Query.ancestors(this.head);
					
					for (const e of ancestors)
					{
						if (!(e instanceof HTMLElement))
							continue;
						
						const oy = window.getComputedStyle(e).overflowY;
						if (oy === "auto" || oy === "scroll")
						{
							this.scrollingAncestor = e;
							break;
						}
					}
				}
				
				this._offsetTop = Query
					.ancestors(this.head, this.scrollingAncestor)
					.filter((e): e is HTMLElement => e instanceof HTMLElement)
					.reduce((a, b) => a + b.offsetTop, 0);
			}
			
			return this._offsetTop;
		}
		private _offsetTop = minInt;
		private scrollingAncestor: HTMLElement | null = null;
	}
	
	//# Utilities & Constants
	
	const within = (low: number, high: number, pct: number) => low + (high - low) * pct;
	
	/** */
	function generateSizeClasses()
	{
		const sizeClasses = new Map<number, string>();
		
		for (let size = minSize; size <= maxSize; size++)
		{
			const params: (string | Hot.Style)[] = [
				`&`, {
					width: (size * 100) + `%`,
					zIndex: 1,
				}
			];
			
			for (let n = -1; ++n < size;)
			{
				params.push(
					` .${Class.previewsContainer} > DIV:nth-of-type(${size}n + ${n + 1})`, {
						left: (100 * n) + "vw",
					}
				);
			}
			
			sizeClasses.set(size, Hot.css(...params));
		};
		
		return sizeClasses;
	}
	
	const minSize = 2;
	const maxSize = 7;
	const minInt = Number.MIN_SAFE_INTEGER;
	
	/** */
	function getIndex(e: Element)
	{
		return Number((Array.from(e.classList)
			.find(cls => cls.startsWith(indexPrefix)) || "")
			.slice(indexPrefix.length)) || 0;
	}
	
	/** */
	function setIndex(e: Element, index: number)
	{
		e.classList.add(indexPrefix + index);
	}
	
	const indexPrefix = "index:";
	
	/** */
	const enum Class
	{
		hasTop = "has-top",
		previewsContainer = "previews-container",
	}
	
	/** */
	const showClass = Hot.css("&&", {
		display: "block",
	});
	
	/** */
	const disableScrollBarsClass = Hot.css(
		"&",
		{
			scrollbarWidth: "none",
			msOverflowStyle: "none",
		},
		"&::-webkit-scrollbar",
		{
			background: "transparent",
			width: 0
		}
	);
	
	/** */
	function getByClass(cls: string, element?: Element)
	{
		const col = (element || document).getElementsByClassName(cls);
		return Array.from(col) as HTMLElement[];
	}
	
	/** */
	async function waitTransitionEnd(e: Element)
	{
		await new Promise<void>(r => e.addEventListener("transitionend", ev =>
		{
			if (ev.target === e)
				r();
		}));
	}
	
	/** */
	export type GetPreviewFn<THat extends Hot.HatLike> = 
		(info: IReviewRequestInfo) => MaybePromise<MaybePromise<THat>[]>;
	
	/** */
	export type GetReviewFn<THat extends Hot.HatLike> = 
		(hat: THat) => MaybePromise<HTMLElement | Scenery | void>;
	
	/** */
	export type MaybePromise<T> = Promise<T> | T;
	
	/** */
	export interface IReviewRequestInfo
	{
		readonly rangeStart: number;
		readonly rangeEnd: number;
		readonly cacheOnly: boolean;
		readonly exitingObject?: object;
	}
	
	/** */
	export const enum PurviewMode
	{
		none,
		review,
		preview,
	}
}
