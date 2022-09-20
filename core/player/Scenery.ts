
namespace Player
{
	/** */
	export class Scenery
	{
		/** */
		constructor(...params: Hot.Param[])
		{
			this.head = Hot.div(
				"scenery",
				{
					overflowX: "hidden",
					overflowY: "auto",
				},
				Hot.css(`& > .${Class.anchor}, & > .${Class.spacer}`, {
					zIndex: -1,
					position: "relative",
					display: "block",
					scrollSnapStop: "always",
					pointerEvents: "none",
				}),
				Hot.css(`& > .${Class.anchor}`, {
					scrollSnapAlign: "start",
				}),
				Hot.css(`& > .${Class.spacer}`, {
					scrollSnapAlign: "end",
				}),
				When.connected(() =>
				{
					Player.observeResize(this.head, () => this.handleResize());
					const mo = new MutationObserver(() => this.recomputeHeights());
					mo.observe(this.head, { childList: true });
					this.recomputeHeights();
					this.updateScroll();
					
					// The scroll-snapping is enabled after the scenes have
					// been added to the Scenery. If we do this right away
					// in the constructor, you'll get weird jumping behavior.
					this.head.style.scrollSnapType = "y mandatory";
				}),
				Hot.on("scroll", () => 
					window.requestAnimationFrame(() => 
						this.updateScroll())),
				
				this.content = Hot.div(
					"scenes-content",
					{
						position: "sticky",
						height: 0,
						top: 0,
					},
					Hot.css(" > *", {
						position: "absolute",
						left: 0,
						right: 0,
						zIndex: 0,
					})
				),
				params
			);
		}
		
		readonly head: HTMLElement;
		readonly content: HTMLElement;
		private readonly scenes: ISceneInternal[] = [];
		
		/** */
		get viewportHeight()
		{
			return this._viewportHeight;
		}
		private _viewportHeight = 0;
		
		/** */
		getScene(index: number)
		{
			if (index < 0)
				index = this.scenes.length + index;
			
			index = Math.max(0, Math.min(this.scenes.length - 1, index));
			return this.scenes[index] as IScene;
		}
		
		/** */
		insert(...elements: HTMLElement[]): Scenery;
		insert(at: number, ...elements: HTMLElement[]): Scenery;
		insert(a: number | HTMLElement, ...elements: HTMLElement[])
		{
			elements = elements.slice();
			if (a instanceof HTMLElement)
				elements.unshift(a);
			
			const newSceneElements: HTMLElement[] = [];
			const newSupportElements: HTMLElement[] = [];
			const newScenes: ISceneInternal[] = [];
			
			for (const element of elements)
			{
				let anchor: HTMLAnchorElement;
				let spacer: HTMLElement;
				
				if (element.isConnected && element.parentElement === this.head)
				{
					anchor = element.previousElementSibling as HTMLAnchorElement;
					spacer = element.nextElementSibling as HTMLElement;
					
					if (!(anchor instanceof HTMLAnchorElement &&
						spacer instanceof HTMLElement &&
						spacer.tagName === "SPAN"))
						throw "Element is not a section.";
				}
				else
				{
					anchor = Hot.a(Class.anchor, {
						name: (++this.anchorIndex).toString(),
						scrollSnapAlign: "start"
					});
					
					spacer = Hot.span(Class.spacer, {
						scrollSnapAlign: "end"
					});
					
					this.synchronizeHeight(element, spacer);
					newSceneElements.push(element);
					newSupportElements.push(anchor, spacer);
				}
				
				const scene: ISceneInternal = {
					anchor,
					spacer,
					element,
					height: element.offsetHeight,
				};
				
				newScenes.push(scene);
				this.streamSceneHeight(scene);
				When.disconnected(element, () => anchor.remove());
			}
			
			const anchors = toHtmlElements(this.head.childNodes)
				.filter((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
			
			const at = typeof a === "number" ? a : anchors.length;
			
			if (at === 0 || at <= -anchors.length)
			{
				this.content.prepend(...newSceneElements);
				this.content.after(...newSupportElements);
				this.scenes.unshift(...newScenes);
			}
			else if (at >= anchors.length)
			{
				this.content.append(...newSceneElements);
				this.head.append(...newSupportElements);
				this.scenes.push(...newScenes);
			}
			else
			{
				this.content.children.item(at)!.before(...newSceneElements);
				anchors.at(at)?.before(...newSupportElements);
				this.scenes.splice(at, 0, ...newScenes);
			}
			
			return this;
		}
		
		/**
		 * 
		 */
		private streamSceneHeight(scene: ISceneInternal)
		{
			Player.observeResize(scene.element, (width, height) =>
			{
				scene.height = height;
			});
		}
		
		/**
		 * Synchronizes the height of the two elements.
		 */
		private synchronizeHeight(src: HTMLElement, dst: HTMLElement)
		{
			Player.observeResize(src, (width, height) =>
			{
				dst.style.height = height + "px";
			});
		}
	
		private anchorIndex = 0;
		
		/** */
		private handleResize()
		{
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(() =>
			{
				const contentElements = this.scenes.map(s => s.element);
				const rect = this.head.getBoundingClientRect();
				const elementsAtPoint = toHtmlElements(
					document.elementsFromPoint(
					rect.left + rect.width / 2,
					rect.top + rect.height / 2)
				);
				
				elementsAtPoint
					.find(e => contentElements.includes(e))
					?.scrollIntoView({ block: "nearest", behavior: "smooth" });
				
				this.recomputeHeights();
			},
			80);
		}
		private resizeTimeout: any = -1;
		
		/** */
		private recomputeHeights()
		{
			this._viewportHeight = this.head.offsetHeight;
			for (const scene of this.scenes)
				scene.height = scene.element.offsetHeight;
		}
		
		/** */
		private updateScroll()
		{
			const viewportTop = this.head.scrollTop;
			const states: IVisibleElementState[] = [];
			let sceneTop = 0;
			let disable = false;
			
			for (const scene of this.scenes)
			{
				const viewportBottom = viewportTop + this._viewportHeight;
				const sceneBottom = sceneTop + scene.height;
				
				if (scene.height > this._viewportHeight &&
					viewportTop > sceneTop && 
					viewportBottom < sceneBottom)
					disable = true;
				
				const isAboveViewport = sceneBottom < viewportTop;
				const isBelowViewport = sceneTop > viewportBottom;
				if (!isAboveViewport && !isBelowViewport)
				{
					const elementTopRatio = percentify(
						viewportTop,
						viewportBottom,
						sceneTop);
					
					const elementBottomRatio = percentify(
						viewportTop,
						viewportBottom,
						sceneBottom);
					
					const state: IVisibleElementState ={
						element: scene.element,
						elementHeight: scene.height,
						elementHeightRatio: scene.height / this._viewportHeight,
						elementTop: sceneTop - viewportTop,
						elementTopRatio,
						elementBottom: sceneBottom - viewportBottom,
						elementBottomRatio,
					};
					
					states.push(state);
					
					let y = state.elementTop;
					for (const compFn of this.scrollComputers)
					{
						const yReturned = compFn(state);
						if (yReturned !== undefined)
						{
							y = yReturned;
							break;
						}
					}
					
					const e = state.element;
					const s = e.style;
					s.top = (y || 0) + "px";
					s.removeProperty("visibility");
				}
				else
				{
					scene.element.style.visibility = "hidden";
				}
				
				sceneTop += scene.height;
			}
			
			this.head.style.scrollSnapType = disable ? "none" : "y mandatory";
			
			for (const listenerFn of this.scrollListeners)
				listenerFn(states);
		}
		
		/**
		 * Adds a computation function that returns a numeric Y value,
		 * which is used to calculate the display position of a scene. 
		 * This function will be called for every visible scene, unless
		 * a previously added computer function has already returned
		 * a Y value. The function should return void for scenes that
		 * aren't applicable to the function.
		 */
		addScrollComputer(computerFn: ScrollComputerFn)
		{
			this.scrollComputers.push(computerFn);
		}
		private readonly scrollComputers: ScrollComputerFn[] = [];
		
		/**
		 * Adds a function that is called after scroll event has been
		 * invoked, and after the scroll computation process has
		 * occured.
		 */
		addScrollListener(listenerFn: ScrollListenerFn)
		{
			this.scrollListeners.push(listenerFn);
		}
		private readonly scrollListeners: ScrollListenerFn[] = [];
	}
	
	/** */
	export type ScrollComputerFn = (state: IVisibleElementState) => number | void;
	
	/** */
	export type ScrollListenerFn = (states: IVisibleElementState[]) => void;
	
	/** */
	function percentify(low: number, high: number, point: number)
	{
		return (point - low) / (high - low);
	}
	
	/** */
	function toHtmlElements(list: NodeList | HTMLCollection | Element[])
	{
		return Array.from(list).filter((e): e is HTMLElement => e instanceof HTMLElement);
	}
	
	/** */
	export interface IScene
	{
		readonly anchor: HTMLAnchorElement;
		readonly spacer: HTMLElement;
		readonly element: HTMLElement;
	}
	
	/** */
	interface ISceneInternal extends IScene
	{
		height: number;
	}
	
	/** */
	export interface IVisibleElementState
	{
		/**
		 * A reference to the HTML element that is currently
		 * visible on the screen, either in full or in part.
		 */
		readonly element: HTMLElement;
		
		/**
		 * The height of the element in pixels.
		 */
		readonly elementHeight: number;
		
		/**
		 * The height of the element, expressed percentage
		 * of the height of the Scenery viewport.
		 */
		readonly elementHeightRatio: number;
		
		/**
		 * Represents the number of pixels between the top of the
		 *  element and the top of the viewport.
		 */
		readonly elementTop: number;
		
		/**
		 * Represents the location of the top of the element within
		 * the viewport, expressed as a percentage.
		 */
		readonly elementTopRatio: number;
		
		/**
		 * Represents the number of pixels between the bottom of the
		 *  element and the bottom of the viewport.
		 */
		readonly elementBottom: number;
		
		/**
		 * Represents the location of the bottom of the element within
		 * the viewport, expressed as a percentage.
		 */
		readonly elementBottomRatio: number;
	}
	
	/** */
	const enum Class
	{
		anchor = "anchor",
		spacer = "spacer",
		intersector = "intersector",
	}
}
