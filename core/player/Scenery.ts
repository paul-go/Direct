
namespace Player
{
	/** */
	export class Scenery
	{
		readonly head: HTMLElement;
		
		/** */
		constructor(...params: Hot.Param[])
		{
			this.head = Hot.div(
				"scenery",
				{
					overflowX: "hidden",
					overflowY: "auto",
					height: "100vh",
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
		
		readonly content: HTMLElement;
		private readonly scenes: ISceneInternal[] = [];
		
		/** */
		private setup()
		{
			this._viewportHeight = this.head.offsetHeight;
			Resize.watch(this.head, (w, height) => this._viewportHeight = height);
			
			for (const scene of this.scenes)
				this.updateSceneHeight(scene, scene.element.offsetHeight);
			
			this.updateScroll();
		}
		
		/** */
		get viewportHeight()
		{
			return this._viewportHeight;
		}
		private _viewportHeight = 0;
		
		/** */
		get(): readonly IScene[];
		get(index: number): IScene;
		get(name: string): IScene | null;
		get(via?: number | string): readonly IScene[] | IScene | null
		{
			if (via === undefined)
				return this.scenes;
			
			if (typeof via === "string")
				return this.scenes.find(sc => sc.name === via) || null;
			
			if (this.scenes.length === 0)
				throw new Error();
			
			if (via < 0)
				via = this.scenes.length + via;
			
			via = Math.max(0, Math.min(this.scenes.length - 1, via));
			return this.scenes[via] as IScene;
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
			Resize.watch(scene.element, (w, height) => this.updateSceneHeight(scene, height));
		}
		
		/** */
		insert(...elements: HTMLElement[]): Scenery;
		insert(at: number, ...elements: HTMLElement[]): Scenery;
		insert(name: string, at: number, element: HTMLElement): Scenery;
		insert(
			a: string | number | HTMLElement,
			b: number | HTMLElement,
			...elements: HTMLElement[])
		{
			elements = elements.slice();
			
			if (b instanceof HTMLElement)
				elements.unshift(b);
			
			if (a instanceof HTMLElement)
				elements.unshift(a);
			
			const anchors = toHtmlElements(this.head.childNodes)
				.filter((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
			
			let at = 
				typeof b === "number" ? b : 
				typeof a === "number" ? a :
				-1;
			
			if (at < 0)
				at += anchors.length + 2;
			
			const name = typeof a === "string" ? a : "";
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
					name,
					anchor,
					spacer,
					element,
					visibilityState: null,
					sceneHeight: this.maybeAdjustHeight(elementHeight),
					elementHeight,
					toggleSnapping(edge, enabled) { that.toggleSnapping(this, edge, enabled); },
					draw(opacity) { that.drawScene(this, opacity); },
					delete() { that.delete(this); }
				};
				
				element.style.visibility = "hidden";
				newScenes.push(scene);
				this.streamSceneHeight(scene);
				When.disconnected(element, () => anchor.remove());
			}
			
			if (at <= 1)
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
			
			this.updateScroll();
			return this;
		}
		
		private anchorIndex = 0;
		
		/** */
		private delete(scene: ISceneInternal)
		{
			scene.anchor.remove();
			scene.spacer.remove();
			scene.element.remove();
			
			for (const [i, s] of this.scenes.entries())
				if (s === scene)
					this.scenes.splice(i, 1);
		}
		
		/** */
		get length()
		{
			return this.content.childElementCount;
		}
		
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
					(scene as NotReadonly<ISceneInternal>).visibilityState = state;
					
					let y = elementTop;
					for (const compFn of this.scrollComputers)
					{
						const yReturned = compFn(state);
						if (typeof yReturned === "number")
						{
							y = yReturned || 0;
							break;
						}
					}
					
					const e = state.element;
					const s = e.style;
					s.top = (y || 0) + "px";
					s.removeProperty("visibility");
					
					// If the scene was drawn as an overlay, make sure
					// this has been cancelled before presenting the
					// scene normally.
					if (this.overlaySceneSheet)
						e.classList.remove(this.overlaySceneSheet.class);
				}
				else
				{
					scene.element.style.visibility = "hidden";
					(scene as NotReadonly<ISceneInternal>).visibilityState = null;
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
		 * Draws a non-interactive representation of the scene on top of all other scenes.
		 */
		private drawScene(scene: IScene, opacity: number)
		{
			this.overlaySceneSheet ||= Hot.css({
				top: "0 !",
				visibility: "visible !",
				zIndex: "9 !",
				pointerEvents: "none !",
			});
			
			const cls = this.overlaySceneSheet.class;
			if (opacity < 0)
			{
				this.overlaySceneSheet.remove();
				this.overlaySceneSheet = null;
				scene.element.classList.remove(cls);
			}
			else
			{
				this.overlaySceneSheet.cssRules[0].style.opacity = opacity.toString();
				scene.element.classList.add(cls);
			}
		}
		private overlaySceneSheet: Hot.Sheet | null = null;
		
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
		
		/** */
		removeScrollComputer(computerFn: ScrollComputerFn)
		{
			for (let i = this.scrollComputers.length; i-- > 0;)
				if (this.scrollComputers[i] === computerFn)
					this.scrollComputers.splice(i, 1);
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
		
		/** */
		removeScrollListener(listenerFn: ScrollListenerFn)
		{
			for (let i = this.scrollListeners.length; i-- > 0;)
				if (this.scrollListeners[i] === listenerFn)
					this.scrollListeners.splice(i, 1);
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
		readonly name: string;
		readonly anchor: HTMLAnchorElement;
		readonly spacer: HTMLElement;
		readonly element: HTMLElement;
		readonly visibilityState: IVisibleElementState | null;
		
		/**
		 * Enables or disables snapping of the scene to the specified edge.
		 */
		toggleSnapping(edge: SceneEdge, enabled: boolean): void;
		
		/**
		 * Draws a non-interactive representation of the scene on top of all other scenes.
		 */
		draw(opacity: number): void;
		
		/**
		 * Deletes this scene from the view.
		 */
		delete(): void;
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
	
	/**
	 * Make all properties in T not readonly.
	 */
	type NotReadonly<T> = { -readonly [P in keyof T]: T[P]; };
}
