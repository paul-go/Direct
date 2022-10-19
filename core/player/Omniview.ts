
namespace Player
{
	/** */
	export class Omniview<THat extends Hot.HatLike = Hot.HatLike>
	{
		/** */
		static get defaultBackground()
		{
			if (this._defaultBackground)
				return this._defaultBackground;
			
			const canvas = Hot.canvas({ width: 32, height: 32 });
			const ctx = canvas.getContext("2d")!;
			const grad = ctx.createLinearGradient(0, 0, 32, 32);
			grad.addColorStop(0, "rgb(50, 50, 50)");
			grad.addColorStop(1, "rgb(0, 0, 0)");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, 32, 32);
			
			return this._defaultBackground = Hot.css({
				backgroundImage: `url(${canvas.toDataURL()})`,
				backgroundSize: "100% 100%",
			});
		}
		private static _defaultBackground: Hot.Sheet | null = null;
		
		readonly head;
		
		/** */
		constructor()
		{
			this.sizeClasses = generateSizeClasses();
			document.body.style.overflowX = "hidden";
			
			this.head = Hot.div(
				"omniview",
				Hot.on(window, "scroll", () => this.updatePreviewVisibility(true)),
				Hot.on(document.body, "keydown", ev => this.handleKeyDown(ev)),
				this.scalerElement = Hot.div(
					"scaler",
					transitionRule,
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
							cursor: "pointer",
						}),
						Hot.css(" > DIV *", {
							pointerEvents: "none"
						}),
					),
					this.reviewContainer = Hot.div(
						"review-container",
						transitionRule,
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
			
			this.setSizeInner(calculateNaturalSize());
			Resize.watch(this.head, async () =>
			{
				if (!this.userHasSetSize)
				{
					this.setSizeInner(calculateNaturalSize());
					await new Promise(r => setTimeout(r));
				}
				
				this.updatePreviewVisibility();
			});
			
			[this.enterReviewFn, this._enterReviewFn] = Force.create<(hat: THat) => void>();
			[this.exitReviewFn, this._exitReviewFn] = Force.create<(reason: ExitReason) => void>();
			
			this.beginOffsetTopTracking();
			
			if (typeof Hat !== "undefined")
				Hat.wear(this);
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
		 * Gets or sets whether the size of the Omniview can be
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
				if (this.mode === OmniviewMode.review)
					this.gotoPreviews();
			}
		}
		
		/** */
		get mode()
		{
			return this._mode;
		}
		private _mode = OmniviewMode.none;
		
		//# Preview Related
		
		/** */
		get previewCount()
		{
			const e = this.previewsContainer.lastElementChild;
			return e ? getIndex(e) : 0;
		}
		
		/** */
		get size()
		{
			return this._size;
		}
		set size(size: number)
		{
			this.setSizeInner(size);
			this.userHasSetSize = true;
		}
		
		/** */
		private setSizeInner(size: number)
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
				
				this.updatePreviewVisibility();
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
		private userHasSetSize = false;
		
		private readonly sizeClasses: ReadonlyMap<number, string>;
		
		/** */
		async gotoPreviews()
		{
			if (this._mode === OmniviewMode.preview)
				return;
			
			if (this.mode === OmniviewMode.review)
				return void await this.exitReviewWithAnimation(ExitReason.other);
			
			this.tryAppendPreviews();
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
				canContinue: promises.length >= requestedCount,
			};
		}
		
		/** */
		private async tryAppendPreviews(screens: number = 3)
		{
			const pullCount = this.size * this.size * screens;
			const rangeStart = this.previewCount;
			const rangeEnd = rangeStart + (pullCount);
			
			const itemRequest = await this.requestPreview({
				cacheOnly: false,
				rangeStart,
				rangeEnd,
			});
			
			if (itemRequest.promises.length === 0)
				return;
			
			const elements: HTMLElement[] = [];
			
			for (const maybePromise of itemRequest.promises)
			{
				if (maybePromise instanceof Promise)
				{
					const shim = Hot.div(
						"element-placeholder",
						Omniview.defaultBackground);
					
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
			
			for (let i = -1; ++i < elements.length;)
				setIndex(elements[i], this.previewCount + i + 1);
			
			this.previewsContainer.append(...elements);
			this.updatePreviewVisibility(itemRequest.canContinue);
		}
		
		/** */
		private updatePreviewVisibility(canContinue?: boolean)
		{
			let isNearingBottom = false;
			
			if (this.previewCount > 0)
			{
				const y = this.scrollTop - this.offsetTop;
				const wh = window.innerHeight;
				const rowHeight = wh / this.size;
				const rowCount = this.previewCount / this.size;
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
				
				if (y !== this.lastY)
				{
					this.lastY = y;
					isNearingBottom = (y + wh) > (rowCount - 1) * (wh / this.size);
				}
			}
			
			if (canContinue && isNearingBottom)
				this.tryAppendPreviews(1);
		}
		
		private lastY = -1;
		
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
		private set currentPreview(value: THat | null)
		{
			this._currentPreview = value;
			this._scalerTranslateX = this._scalerTranslateY = minInt;
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
			if (this._currentPreview)
			{
				const col = this.columnOf(this._currentPreview.head);
				const row = this.rowOf(this._currentPreview.head);
				const wh = window.innerHeight;
				const scrollYinVh = (this.scrollTop - this.offsetTop) / wh * 100;
				this._scalerTranslateX = (-100 / this.size * col) || 0;
				this._scalerTranslateY = (-100 * row + scrollYinVh) || 0;
			}
			else
			{
				this._scalerTranslateX = this._scalerTranslateY = 0;
			}
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
		
		/**
		 * Stores a reference to the HTMLElement that takes the place
		 * of the actual preview element, in the case when the preview
		 * is used as a portal rather than a preview.
		 */
		private portalPlaceholder: HTMLElement | null = null;
		
		/** */
		async gotoReview(previewHat: THat)
		{
			if (this._mode === OmniviewMode.review)
				return;
			
			let scenery: Scenery;
			
			// If the previewHat is already a scenery, then we just need
			// to do a reviewRequest in order to provide an opportunity
			// for the scenery to be augmented before being converted
			// into review mode.
			if (previewHat instanceof Scenery)
			{
				scenery = previewHat;
				
				const scenes = 
					this.scenesCache.get(previewHat) ||
					await this.scenesRequestFn?.(previewHat);
				
				this._enterReviewFn(previewHat);
				
				if (scenes)
				{
					this.scenesCache.set(previewHat, scenes);
					scenery.insert(...scenes);
				}
				
				this.portalPlaceholder = Hot.div("portal-placeholder");
			}
			else
			{
				const requestResult = await this.reviewRequestFn?.(previewHat);
				if (!requestResult)
					return;
				
				this._enterReviewFn(previewHat);
				
				scenery = requestResult instanceof Scenery ?
					requestResult :
					new Scenery().insert(requestResult);
			}
			
			const sectionFirst = scenery.get(0);
			const sectionLast = scenery.get(-1);
			const exitHeight = 60;
			const exitHeightRatio = exitHeight / 100;
			const exitStyles: Hot.Style = {
				height: exitHeight + "vh",
				zIndex: -2,
			};
			
			const exitUpElement = Hot.div("exit-up", exitStyles);
			const exitDownElement = Hot.div("exit-down", exitStyles);
			scenery.insert(SceneName.enter, 0, exitUpElement);
			scenery.insert(SceneName.exit, -1, exitDownElement);
			
			this.currentPreview = previewHat;
			this._currentScenery = scenery;
			this._mode = OmniviewMode.review;
			
			// Insert an empty div so that the CSS nth-child selector doesn't get screwed up.
			if (this.portalPlaceholder)
			{
				previewHat.head.replaceWith(this.portalPlaceholder);
				this.reviewContainer.replaceChildren(previewHat.head);
			}
			else this.reviewContainer.replaceChildren(scenery.head);
			
			Hot.get(this.reviewContainer)({
				display: "block",
				left: Math.abs(this.scalerTranslateX) + "%",
				top: (100 * this.rowOf(previewHat.head)) + "vh",
				opacity: this.portalPlaceholder ? 1 : 0,
			});
			
			if (this.portalPlaceholder)
				scenery.head.classList.add(zeroTopRule.class);
			
			await new Promise(r => setTimeout(r));
			scenery.head.scrollTo({ top: sectionFirst.anchor.offsetTop });
			this.setScalerTransform(1);
			
			if (!this.portalPlaceholder)
				this.reviewContainer.style.opacity = "1";
			
			await waitTransitionEnd(this.scalerElement);
			this.toggleScalerTransitions(false);
			
			scenery.addScrollComputer(this.currentSceneryScrollComputer = state =>
			{
				if (state.element === sectionFirst.element)
					if (state.elementTopRatio >= 0 && state.elementTopRatio <= exitHeightRatio)
						return 0;
				
				if (state.element === sectionLast.element)
					if (state.elementBottomRatio <= 1)
						return Math.max(window.innerHeight - state.elementHeight, state.elementTop);
			});
			
			scenery.addScrollListener(this.currentSceneryScrollListener = states =>
			{
				const state = states.find(s => 
					s.element === exitUpElement || 
					s.element === exitDownElement);
				
				const isExitingDown = state?.element === exitDownElement;
				
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
				
				if (!this.portalPlaceholder)
				{
					this.reviewContainer.style.opacity = mul.toString();
				}
				else if (isExitingDown)
				{
					const scene = scenery.get(1);
					const scene0State = states.find(state => state.element === scene.element);
					if (!scene0State)
						scene.draw(1 - mul);
				}
				
				// Actually exit
				if (mul < 0.005)
				{
					this.exitReview(isExitingDown ? 
						ExitReason.swipeDown : 
						ExitReason.swipeUp);
				}
			});
			
			this._mode = OmniviewMode.review;
		}
		
		private readonly scenesCache = new WeakMap<Scenery, HTMLElement[]>();
		private currentSceneryScrollComputer: ScrollComputerFn | null = null;
		private currentSceneryScrollListener: ScrollListenerFn | null = null;
		
		/** */
		private async exitReviewWithAnimation(exitReason: ExitReason)
		{
			this.toggleScalerTransitions(true);
			this.setScalerTransform(0);
			
			if (this.portalPlaceholder)
			{
				const scene = this.currentScenery?.get(1);
				if (scene)
				{
					if (scene.visibilityState)
					{
						scene.draw(1);
						await waitTransitionEnd(this.scalerElement);
						scene.draw(-1);
					}
					else
					{
						scene.draw(0.001);
						await new Promise(r => setTimeout(r));
						const e = scene.element;
						e.classList.add(transitionRule.class);
						e.style.transitionProperty = "opacity";
						scene.draw(1);
						await waitTransitionEnd(e);
						e.classList.remove(transitionRule.class);
						e.style.removeProperty("transition-property");
					}
				}
			}
			else
			{
				this.reviewContainer.style.opacity = "0";
				await waitTransitionEnd(this.reviewContainer);
			}
			
			this.exitReview(exitReason);
		}
		
		/** */
		private async exitReview(exitReason: ExitReason)
		{
			if (this.currentScenery)
			{
				if (this.currentSceneryScrollComputer)
					this.currentScenery.removeScrollComputer(this.currentSceneryScrollComputer);
				
				if (this.currentSceneryScrollListener)
					this.currentScenery.removeScrollListener(this.currentSceneryScrollListener);
			}
			
			if (this.portalPlaceholder)
			{
				const e = this.reviewContainer.firstElementChild;
				if (e)
				{
					e.classList.remove(zeroTopRule.class);
					this.portalPlaceholder.replaceWith(e);
				}
				
				const sc = this.currentScenery;
				if (sc)
				{
					// Delete everything other than the hero scene.
					sc.get(SceneName.enter)?.delete();
					sc.get(SceneName.exit)?.delete();
					sc.get().slice(1).map(sc => sc.delete());
				}
				
				this.portalPlaceholder = null;
			}
			
			this._currentScenery = null;
			this._mode = OmniviewMode.preview;
			this._scalerTranslateX = minInt;
			this._scalerTranslateY = minInt;
			this.scalerElement.style.removeProperty("transition-duration");
			this.reviewContainer.replaceChildren();
			
			for (const property of Array.from(this.reviewContainer.style))
				this.reviewContainer.style.removeProperty(property);
			
			this._exitReviewFn(exitReason);
			this._currentPreview = null;
		}
		
		/** */
		handleReviewRequest(fn: GetReviewFn<THat>)
		{
			this.reviewRequestFn = fn;
		}
		private reviewRequestFn?: GetReviewFn<THat>;
		
		/** */
		handleScenesRequest(fn: GetScenesFn<THat>)
		{
			this.scenesRequestFn = fn;
		}
		private scenesRequestFn?: GetScenesFn<THat>;
		
		/** */
		private beginOffsetTopTracking()
		{
			const mo = new MutationObserver(() =>
			{
				clearTimeout(this.timeoutId);
				this.timeoutId = setTimeout(() => this._offsetTop = minInt, 1);
			});
			mo.observe(this.head, { childList: true, subtree: true, attributes: true });
			When.disconnected(this.head, () => mo.disconnect());
		}
		private timeoutId: any = 0;
		
		/** */
		private get offsetTop()
		{
			if (this._offsetTop === minInt)
			{
				this._offsetTop = Query
					.ancestors(this.head, this.scrollingAncestor)
					.filter((e): e is HTMLElement => e instanceof HTMLElement)
					.reduce((a, b) => a + b.offsetTop, 0);
			}
			
			return this._offsetTop;
		}
		private _offsetTop = minInt;
		
		/** */
		private get scrollTop()
		{
			const e = this.scrollingAncestor;
			return e === document.documentElement || e === document.body ?
				window.scrollY :
				e.scrollTop;
		}
		
		/** */
		private get scrollingAncestor()
		{
			if (this._scrollingAncestor === null)
			{
				this._scrollingAncestor = document.documentElement;
				const ancestors = Query.ancestors(this.head);
				
				for (const e of ancestors)
				{
					if (!(e instanceof HTMLElement))
						continue;
					
					const oy = window.getComputedStyle(e).overflowY;
					if (oy === "auto" || oy === "scroll")
					{
						this._scrollingAncestor = e;
						break;
					}
				}
			}
			
			return this._scrollingAncestor;
		}
		private _scrollingAncestor: HTMLElement | null = null;
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
			
			sizeClasses.set(size, Hot.css(...params).class);
		};
		
		return sizeClasses;
	}
	
	/**
	 * Calculates a comfortable preview size based on the size and pixel density
	 * of the screen. (The technique used is probably quite faulty, but good enough
	 * for most scenarios).
	 */
	function calculateNaturalSize()
	{
		const dp1 = window.devicePixelRatio === 1;
		const logicalWidth = window.innerWidth / window.devicePixelRatio;
		
		if (logicalWidth <= (dp1 ? 900 : 450))
			return 2;
		
		if (logicalWidth <= (dp1 ? 1400 : 700))
			return 3;
		
		if (logicalWidth <= 1800)
			return 4;
		
		return 5;
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
	}).class;
	
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
	const transitionRule = Hot.css({
		transitionDuration: "0.33s",
		transitionTimingFunction: "ease-in-out",
	});
	
	/**
	 * This rule must be added to portals when they're moved from the preview
	 * container into the review container. This is necessary because portals are
	 * the same element as previews, and when they're moved into the review 
	 * container, they still hold their inline CSS top value which is necessary to
	 * position the preview at it's proper position in the omniview. However,
	 * when the portal is in the review container, it's top edge needs to be aligned
	 * with the top edge of the review container. And also, the top value needs to
	 * be reset back to its original value when it's moved back into the preview
	 * container.
	 */
	const zeroTopRule = Hot.css("& !", {
		top: 0,
	});
	
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
	export type GetScenesFn<THat extends Hot.HatLike> = 
		(scenery: THat) => MaybePromise<HTMLElement[]>;
	
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
	export const enum OmniviewMode
	{
		none,
		review,
		preview,
	}
	
	/** */
	export const enum ExitReason
	{
		swipeUp,
		swipeDown,
		other,
	}
	
	/** */
	export const enum SceneName
	{
		enter = "enter",
		exit = "exit",
		hero = "hero",
	}
}
