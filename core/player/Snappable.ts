
namespace Player
{
	/** */
	export class Snappable
	{
		/** */
		constructor(...params: Hot.Param[])
		{
			[this.scrollFn, this._scrollFn] = Force.create<(states: IVisibleElementState[]) => void>();
			
			this.head = Hot.div(
				"snappable",
				{
					overflowX: "hidden",
					overflowY: "auto",
				},
				Hot.css("& > *", {
					position: "absolute",
					left: 0,
					right: 0,
				}),
				Hot.css("& > A, & > SPAN", {
					position: "relative",
					display: "block",
					scrollSnapStop: "always",
				}),
				Hot.css("& > A", {
					scrollSnapAlign: "start",
				}),
				Hot.css("& > SPAN", {
					scrollSnapAlign: "end",
				}),
				When.connected(() =>
				{
					this.handleConnected();
					
					// The scroll-snapping is enabled after the sections have
					// been added to the Snappable. If we do this right away
					// in the constructor, you'll get weird jumping behavior.
					this.head.style.scrollSnapType = "y mandatory";
				}),
				Hot.on("scroll", () => this.handleScroll()),
				params
			);
		}
		
		readonly head: HTMLElement;
		private readonly sections: ISnappableSectionInternal[] = [];
		
		readonly scrollFn;
		private readonly _scrollFn;
		
		/** */
		get viewportHeight()
		{
			return this._viewportHeight;
		}
		private _viewportHeight = 0;
		
		/** */
		getSection(index: number)
		{
			if (index < 0)
				index = this.sections.length + index;
			
			index = Math.max(0, Math.min(this.sections.length - 1, index));
			return this.sections[index] as ISnappableSection;
		}
		
		/** */
		insert(...elements: HTMLElement[]): Snappable;
		insert(at: number, ...elements: HTMLElement[]): Snappable;
		insert(a: number | HTMLElement, ...elements: HTMLElement[])
		{
			elements = elements.slice();
			if (a instanceof HTMLElement)
				elements.unshift(a);
			
			const newElements: HTMLElement[] = [];
			const newSections: ISnappableSectionInternal[] = [];
			
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
					anchor = Hot.a({
						name: (++this.anchorIndex).toString(),
						scrollSnapAlign: "start"
					});
					
					spacer = Hot.span({
						scrollSnapAlign: "end"
					});
					
					this.maybeSynchronizeHeight(element, spacer);
					newElements.push(anchor, element, spacer);
				}
				
				newSections.push({
					anchor,
					spacer,
					element,
					height: element.offsetHeight,
				});
				
				When.disconnected(element, () => anchor.remove());
			}
			
			const anchors = toHtmlElements(this.head.childNodes)
				.filter((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
			
			const at = typeof a === "number" ? a : anchors.length;
			
			if (at >= anchors.length)
			{
				this.head.append(...newElements);
				this.sections.push(...newSections);
			}
			else if (at <= -anchors.length)
			{
				this.head.prepend(...newElements);
				this.sections.unshift(...newSections);
			}
			else
			{
				anchors.at(at)?.before(...newElements);
				this.sections.splice(at, 0, ...newSections);
			}
			
			return this;
		}
		
		/**
		 * Synchronizes the height of the two elements, but avoid this in the
		 * case when the CSS position property on the source element is set
		 * to a value that causes the element to consume layout space.
		 */
		private maybeSynchronizeHeight(src: HTMLElement, dst: HTMLElement)
		{
			const usesLayout = () =>
			{
				const pos = src.style.position;
				return ["-webkit-sticky", "sticky", "relative", "static"].includes(pos);
			}
			
			When.connected(src, () =>
			{
				if (!usesLayout())
					dst.style.height = src.offsetHeight + "px";
				
				Player.observeResize(src, rect =>
				{
					if (!usesLayout())
						dst.style.height = rect.height + "px";
				});
			});
		}
	
		private anchorIndex = 0;
		
		/** */
		private handleConnected()
		{
			Player.observeResize(this.head, () => this.handleResize());
			const mo = new MutationObserver(() => this.recomputeHeights());
			mo.observe(this.head, { childList: true });
			this.recomputeHeights();
		}
		
		/** */
		private handleResize()
		{
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(() =>
			{
				const contentElements = this.sections.map(s => s.element);
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
			for (const section of this.sections)
				section.height = section.element.offsetHeight;
		}
		
		/** */
		private handleScroll()
		{
			window.requestAnimationFrame(() =>
			{
				const viewportTop = this.head.scrollTop;
				const states: IVisibleElementState[] = [];
				let sectionTop = 0;
				let disable = false;
				
				for (const section of this.sections)
				{
					const viewportBottom = viewportTop + this._viewportHeight;
					const sectionBottom = sectionTop + section.height;
					
					if (section.height > this._viewportHeight &&
						viewportTop > sectionTop && 
						viewportBottom < sectionBottom)
						disable = true;
					
					if (viewportTop <= sectionBottom && viewportBottom >= sectionTop)
					{
						const elementTopRatio = percentify(
							viewportTop,
							viewportBottom,
							sectionTop);
						
						const elementBottomRatio = percentify(
							viewportTop,
							viewportBottom,
							sectionBottom);
						
						states.push({
							element: section.element,
							elementHeight: section.height / this._viewportHeight,
							elementTopRatio,
							elementBottomRatio,
						});
					}
					
					sectionTop += section.height;
				}
				
				this.head.style.scrollSnapType = disable ? "none" : "y mandatory";
				this._scrollFn(states);
			});
		}
	}
	
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
	export interface ISnappableSection
	{
		readonly anchor: HTMLAnchorElement;
		readonly spacer: HTMLElement;
		readonly element: HTMLElement;
	}
	
	/** */
	interface ISnappableSectionInternal extends ISnappableSection
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
		 * The height of the element, expressed percentage
		 * of the height of the Snappable viewport.
		 */
		readonly elementHeight: number;
		
		/**
		 * Represents the location of the top of the element within
		 * the viewport, expressed as a percentage.
		 */
		readonly elementTopRatio: number;
		
		/**
		 * Represents the location of the bottom of the element within
		 * the viewport, expressed as a percentage.
		 */
		readonly elementBottomRatio: number;
	}
}
