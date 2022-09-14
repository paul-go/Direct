
namespace Player
{
	/** */
	export class Purview<THat extends Hot.HatLike = Hot.HatLike>
	{
		/** */
		constructor()
		{
			this.sizeClasses = generateSizeClasses();
			
			const transitionClass = Hot.css({
				transitionDuration: "0.33s",
				transitionTimingFunction: "ease-in-out",
			});
			
			document.body.style.overflowX = "hidden";
			document.body.style.overflowY = "auto";
			
			this.head = Hot.div(
				"purview",
				Hot.on(window, "scroll", () => this.updatePreviews()),
				Hot.on(document.body, "keydown", ev => this.handleKeyDown(ev)),
				this.scalerElement = Hot.div(
					"scaler",
					transitionClass,
					{
						position: "absolute",
						top: 0,
						left: 0,
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
			
			Player.observeResize(this.head, () =>
			{
				this.updatePreviews();
			});
		}
		
		readonly head;
		private readonly scalerElement;
		private readonly previewsContainer;
		private readonly reviewContainer;
		
		/** */
		private handleKeyDown(ev: KeyboardEvent)
		{
			if (ev.metaKey || ev.ctrlKey)
			{
				if (ev.key === "=")
					this.size--;
				
				else if (ev.key === "-")
					this.size++;
				
				else return;
				
				ev.preventDefault();
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
				return this.gotoPreview();
			
			this.populatePreviews("below");
		}
		
		/** */
		async gotoPreview()
		{
			if (this.mode === PurviewMode.preview)
				return;
			
			this.exitReviewWithAnimation();
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
			const result = this.previewRequestFn?.(rr);
			if (!result)
				return;
			
			const count = rr.rangeEnd - rr.rangeStart;
			const hats = await result;
			
			return {
				promises: hats,
				terminate: hats.length < count,
			};
		}
		
		/** */
		private async populatePreviews(where: "above" | "below", screens: number = 3)
		{
			if (this.isPopulatingPreviews)
				return;
			
			this.isPopulatingPreviews = true;
			
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
			
			if (!itemRequest)
				return;
			
			const elements: HTMLElement[] = [];
			
			for (const promise of itemRequest.promises)
			{
				const shim = Hot.div("element-placeholder");
				elements.push(shim);
				
				promise.then(hat =>
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
			
			if (above)
			{
				const count = this.prependedPreviewCount;
				const len = elements.length;
				for (let i = -1; ++i < len;)
				{
					const e = elements[i];
					setIndex(e, -(count + len + i + 1));
				}
				
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
			
			this.updatePreviews();
			this.isPopulatingPreviews = false;
		}
		
		/** */
		private updatePreviews()
		{
			if (this.totalPreviewCount === 0)
				return;
			
			const y = window.scrollY;
			const wh = window.innerHeight;
			const rowHeight = wh / this.size;
			const rowCount = this.totalPreviewCount / this.size;
			const visibleRowStart = Math.floor(y / rowHeight);
			const visibleItemStart = visibleRowStart * this.size;
			const visibleItemEnd = visibleItemStart + this.size * (this.size + 1);
			const elementsWithTop = new Set(getByClass(Class.hasTop, this.previewsContainer));
			const elementsVisible = new Set(getByClass(showClass, this.previewsContainer));
			
			for (let i = visibleItemStart; i < visibleItemEnd; i++)
			{
				const e = this.previewsContainer.children.item(i);
				if (!(e instanceof HTMLElement))
					continue;
				
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
			
			const isNearingTop = y < rowHeight;
			const isNearingBottom = (y + wh) > (rowCount - 1) * (wh / this.size);
			
			if (isNearingBottom)
				this.populatePreviews("below", 1);
			
			if (0 && isNearingTop)
				this.populatePreviews("above", 1);
		}
		
		private isPopulatingPreviews = false;
		
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
			const scrollYinVh = window.scrollY / wh * 100;
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
			
			const scenery = requestResult instanceof Scenery ?
				requestResult :
				new Scenery().insert(requestResult);
			
			const exitHeight = 100;
			const exitStyles: Hot.Style = {
				height: exitHeight + "vh",
				zIndex: -1,
			};
			
			const exitUpElement = Hot.div("exit-up", exitStyles);
			const exitDownElement = Hot.div("exit-down", exitStyles);
			
			scenery.insert(0, exitUpElement);
			scenery.insert(exitDownElement);
			
			this._currentScenery = scenery;
			this._currentPreview = previewHat;
			this._mode = PurviewMode.review;
			this.reviewContainer.replaceChildren(scenery.head);
			
			// Make sure the first visible frame is shown (not the exitUpElement)
			const section1 = scenery.getSection(1);
			const sectionLast = scenery.getSection(-2);
			
			// This is a bit awkward, but if the height of section1 is less
			// than the height of the viewport, strange UI will happen.
			Hot.get(section1.element)({
				minHeight: "100%",
				position: "sticky",
				bottom: 0,
			});
			
			Hot.get(sectionLast.element)({
				position: "sticky",
				top: 0,
			});
			
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
			scenery.head.scrollTo({ top: section1.anchor.offsetTop });
			this.reviewContainer.style.opacity = "1";
			await waitTransitionEnd(this.reviewContainer);
			this.toggleScalerTransitions(false);
			
			scenery.scrollFn(states => window.requestAnimationFrame(() =>
			{
				const exitUpState = states.find(st => st.element === exitUpElement);
				const exitDownState = states.find(st => st.element === exitDownElement);
				let mul = 1;
				
				if (exitUpState)
				{
					mul = 1 - exitUpState.elementBottomRatio / (exitHeight / 100);
					this.setScalerTransform(mul);
				}
				else if (exitDownState)
				{
					mul = exitDownState.elementTopRatio / (exitHeight / 100);
					this.setScalerTransform(mul);
				}
				else 
				{
					this.setScalerTransform(1);
				}
				
				this.reviewContainer.style.opacity = mul.toString();
				
				// Actually exit
				if (mul === 0)
					this.exitReview();
			}));
			
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
		}
		
		/** */
		handleReviewRequest(fn: GetReviewFn<THat>)
		{
			this.reviewRequestFn = fn;
		}
		private reviewRequestFn?: GetReviewFn<THat>;
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
					//transform: `translateX(0) translateY(0) scale(${1 / size})`,
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
		display: "flex",
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
		(info: IReviewRequestInfo) => Promise<Promise<THat>[]>;
	
	/** */
	export type GetReviewFn<THat extends Hot.HatLike> = 
		(hat: THat) => Promise<HTMLElement | Scenery>;
	
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
