
namespace Player
{
	/** Fake */
	declare const Hat: { wear(target: object): void; };
	
	/**
	 * Converts the element to use custom "overlay" scroll bars 
	 * (scroll bars that don't take up space), in the case when the
	 * platform is using "classic" scroll bars (scroll bars that take up space).
	 */
	export function scrollable(axis: ScrollableAxis = "y"): Hot.Param
	{
		maybeInstallBarsDetector();
		return e =>
		{
			Hot.get(e)(
				{
					overflowX: axis === "x" ? "auto" : "hidden",
					overflowY: axis === "y" ? "auto" : "hidden",
				},
			);
			
			new Scrollable(e, axis);
		};
	}
	
	/** */
	export class Scrollable
	{
		/** */
		constructor(
			readonly head: HTMLElement,
			readonly axis: ScrollableAxis)
		{
			const headIsBody = head === document.body;
			this.scrollTarget = headIsBody ? window : head;
			
			Hot.get(head)(
				Hot.on(this.scrollTarget, "scroll", () =>
				{
					if (hasBars)
					{
						this.makeTemporarilyVisible();
						if (!this.isPointerCaptured)
							this.repaint();
					}
				}),
				Hot.on(window, "scrollbars-changed" as any, () =>
				{
					this.updateBarsState();
				}),
			);
			
			this.track = Hot.div(
				"scroll-track",
				{
					position: headIsBody ? "fixed" : "sticky",
					float: "right",
					top: 0,
					right: 0,
					height: "100%",
					width: 0,
					zIndex: 999,
					pointerEvents: "none",
				},
				this.thumb = Hot.div(
					"scroll-thumb",
					{
						position: "absolute",
						top: 0,
						right: 0,
						width: "12px",
						pointerEvents: "all",
						transitionProperty: "opacity",
						transitionDuration: "0.25s",
						opacity: 0,
					},
					Hot.css(":hover !", {
						opacity: 1,
					}),
					Hot.css(":before", {
						content: `""`,
						position: "absolute",
						top: "3px",
						left: "3px",
						bottom: "3px",
						right: "3px",
						borderRadius: "100px",
						backgroundColor: "rgba(64, 64, 64, 0.66)",
						opacity: "inherit",
					}),
					Hot.on("pointerdown", ev => this.startDrag(ev)),
					Hot.on("pointerup", ev => this.endDrag(ev)),
					Hot.on("pointercancel", ev => this.endDrag(ev)),
					Hot.on(document.body, "pointermove", ev =>
					{
						this.handlePointerMove(ev);
					}),
				),
			);
			
			Resize.watch(head, () => hasBars && this.repaint());
			this.watchChildResize();
			this.updateBarsState();
			
			if (typeof Hat !== "undefined")
				Hat.wear(this);
		}
		
		readonly track;
		readonly thumb;
		private readonly scrollTarget: Window | HTMLElement;
		private isPointerCaptured = false;
		
		/** */
		private updateBarsState()
		{
			if (hasBars)
			{
				Hot.get(this.head)(
					weakRelativeRule,
					disableScrollBarsRule);
				
				this.head.prepend(this.track);
			}
			else
			{
				this.head.classList.remove(
					weakRelativeRule.class,
					disableScrollBarsRule.class);
				
				this.track.remove();
			}
		}
		
		/** */
		private watchChildResize()
		{
			const mo = new MutationObserver(() =>
			{
				if (!hasBars)
					return;
				
				for (let i = -1; ++i < this.head.childNodes.length;)
				{
					const child = this.head.childNodes.item(i);
					if (child instanceof HTMLElement && !observedChildren.has(child))
					{
						observedChildren.add(child);
						Resize.watch(child, () => this.repaint());
					}
				}
			});
			mo.observe(this.head, { childList: true, attributes: true });
		}
		
		/** */
		private repaint()
		{
			clearTimeout(this.repaintTimeout)
			this.repaintTimeout = setTimeout(() =>
			{
				window.requestAnimationFrame(() =>
				{
					const scrollHeight = this.head.scrollHeight;
					const offsetHeight = this.head.offsetHeight;
					const pct = offsetHeight / scrollHeight;
					const scrollTop = this.scrollTarget === window ? 
						window.scrollY : 
						this.head.scrollTop;
					
					this.thumb.style.top = ((scrollTop / scrollHeight) * 100) + "%";
					this.thumb.style.height = (pct * 100) + "%";
				});
			}, 5);
		}
		private repaintTimeout: any = 0;
		
		/** */
		private makeTemporarilyVisible()
		{
			if (!hasBars)
				return;
			
			// Kill the fade transition
			this.thumb.remove();
			this.thumb.classList.add(forceVisibleRule.class);
			this.track.append(this.thumb);
			
			clearTimeout(this.tempVisibleTimeout);
			this.tempVisibleTimeout = setTimeout(() =>
			{
				this.thumb.classList.remove(forceVisibleRule.class);
			}, 
			500);
		}
		private tempVisibleTimeout: any = 0;
		
		/** */
		private startDrag(ev: PointerEvent)
		{
			if (ev.buttons === 1)
				this.head.setPointerCapture(ev.pointerId);
		}
		
		/** */
		private endDrag(ev: PointerEvent)
		{
			this.head.releasePointerCapture(ev.pointerId);
		}
		
		/** */
		private handlePointerMove(ev: PointerEvent)
		{
			if (!this.head.hasPointerCapture(ev.pointerId))
				return;
			
			window.requestAnimationFrame(() =>
			{
				this.scrollTarget.scrollTo(0, ev.clientY);
			});
		}
	}
	
	const observedChildren = new WeakSet<HTMLElement>();
	
	/** */
	const disableScrollBarsRule = Hot.css(
		"&",
		{
			scrollbarWidth: "none", // Firefox-specific
			msOverflowStyle: "none",
		},
		"&::-webkit-scrollbar",
		{
			background: "transparent",
			width: 0
		}
	);
	
	/** */
	function maybeInstallBarsDetector()
	{
		if (detectorElement)
			return;
		
		detectorElement = Hot.div(
			{
				position: "absolute",
				left: "-999vw",
				width: "10px",
				height: "10px",
				overflow: "hidden auto",
			},
			scrollerElement = Hot.div(
				{
					height: "200%",
					width: "100%",
				}
			),
		);
		
		Resize.watch(scrollerElement, maybeTriggerScrollbarsChanged);
		document.body.prepend(detectorElement);
		maybeTriggerScrollbarsChanged();
	}
	
	/** */
	function maybeTriggerScrollbarsChanged()
	{
		const storedHasBars = hasBars;
		hasBars = detectorElement.offsetWidth !== scrollerElement.clientWidth;
		
		if (storedHasBars !== hasBars)
		{
			const event = new Event("scrollbars-changed");
			window.dispatchEvent(event);
		}
	}
	
	let detectorElement: HTMLElement;
	let scrollerElement: HTMLElement;
	let hasBars = false;
	
	const weakRelativeRule = Hot.css({ position: "relative" });
	const forceVisibleRule = Hot.css({ opacity: "1 !" });
	
	export type ScrollableAxis = "x" | "y";
}
