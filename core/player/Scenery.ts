
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
					backgroundColor: "gray",
				}),
				When.connected(() =>
				{
					this.setup();
					
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
		private setup()
		{
			this._viewportHeight = this.head.offsetHeight;
			Player.observeResize(this.head, (w, height) => this._viewportHeight = height);
			
			for (const scene of this.scenes)
				this.updateSceneHeight(scene, scene.element.offsetHeight);
			
			this.updateScroll();
		}
		
		/** */
		private isWithinAdjustRange(height: number)
		{
			return (
				height > this.viewportHeight * viewportElementRatio && 
				height <= this.viewportHeight * 2);
		}
		
		/** */
		private maybeAdjustHeight(height: number)
		{
			return this.isWithinAdjustRange(height) ? this.viewportHeight * 2.001 : height;
		}
		
		/** */
		private updateSceneHeight(scene: ISceneInternal, height: number)
		{
			scene.elementHeight = height;
			height = this.maybeAdjustHeight(height);
			scene.sceneHeight = height;
			scene.spacer.style.height = height + "px";
		}
		
		/** */
		private streamSceneHeight(scene: ISceneInternal)
		{
			Player.observeResize(scene.element, (w, height) => this.updateSceneHeight(scene, height));
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
					});
					
					spacer = Hot.span(Class.spacer);
					
					newSceneElements.push(element);
					newSupportElements.push(anchor, spacer);
				}
				
				const elementHeight = element.offsetHeight;
				const that = this;
				const scene: ISceneInternal = {
					anchor,
					spacer,
					element,
					sceneHeight: this.maybeAdjustHeight(elementHeight),
					elementHeight,
					toggleSnapping(edge, enabled) { that.toggleSnapping(this, edge, enabled); }
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
		
		private anchorIndex = 0;
		
		/** */
		private updateScroll()
		{
			const viewportTop = this.head.scrollTop;
			const states: IVisibleElementState[] = [];
			let sceneTop = 0;
			
			for (const scene of this.scenes)
			{
				const viewportBottom = viewportTop + this._viewportHeight;
				const sceneBottom = sceneTop + scene.sceneHeight;
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
					
					let elementTop = sceneTop - viewportTop;
					
					if (this.isWithinAdjustRange(scene.elementHeight) && elementTop < 0)
					{
						const extra = scene.sceneHeight - scene.elementHeight;
						
						if (elementBottomRatio < 1)
						{
							elementTop += extra;
						}
						else
						{
							const factor = within(sceneTop, sceneBottom - this.viewportHeight, viewportTop);
							elementTop += extra * factor;
						}
					}
					
					const state: IVisibleElementState = {
						sceneHeight: scene.sceneHeight,
						element: scene.element,
						elementHeight: scene.sceneHeight,
						elementHeightRatio: scene.sceneHeight / this._viewportHeight,
						elementTop,
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
				
				sceneTop += scene.sceneHeight;
			}
			
			for (const listenerFn of this.scrollListeners)
				listenerFn(states);
		}
		
		/**
		 * Unused code. Leaving it here because this might be necessary in the future.
		 */
		private toggleSnapping(scene: ISceneInternal, edge: SceneEdge, enabled: boolean)
		{
			if (edge === "top")
			{
				scene.anchor.style.scrollSnapStop = enabled ? "always" : "none";
				scene.anchor.style.scrollSnapAlign = enabled ? "start" : "none";
			}
			else
			{
				scene.spacer.style.scrollSnapStop = enabled ? "always" : "none";
				scene.spacer.style.scrollSnapAlign = enabled ? "bottom" : "none";
			}
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
	
	/**
	 * Stores the maximum ratio of the height of the scene element to the
	 * height of the viewport before the scene switches over to using
	 * scroll speed reduction.
	 */
	const viewportElementRatio = 1.33333;
	
	/** */
	const within = (low: number, high: number, mid: number) => (mid - low) / (high - low);
	
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
		
		/**
		 * Enables or disables snapping of the scene to the specified edge.
		 */
		toggleSnapping(edge: SceneEdge, enabled: boolean): void;
	}
	
	/** */
	export type SceneEdge = "top" | "bottom";
	
	/** */
	interface ISceneInternal extends IScene
	{
		sceneHeight: number;
		elementHeight: number;
	}
	
	/** */
	export interface IVisibleElementState
	{
		/**
		 * Stores the height of the scene, which may be greater
		 * than the height of the element in the case when the
		 * height of the element is within the adjustment-required
		 * range.
		 */
		readonly sceneHeight: number;
		
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
