
namespace App
{
	/** */
	export interface ISurfaceOptions
	{
		class?: string;
		background?: "black" | "white";
		closeOnEscape?: boolean;
		closeFn?: boolean | (() => void);
		acceptFn: () => void;
		params?: Hot.Param[];
	}
	
	/** */
	export namespace Surface
	{
		/** */
		export function open(options: ISurfaceOptions)
		{
			return new SurfaceHat(options).head;
		}
		
		/** */
		export function close(surfaceElement: HTMLElement)
		{
			const ctl = Hat.get(surfaceElement, SurfaceHat);
			ctl?.close();
		}
		
		/** */
		export function accept(surfaceElement: HTMLElement)
		{
			const ctl = Hat.get(surfaceElement, SurfaceHat);
			ctl?.close("accept");
		}
	}
	
	/** */
	class SurfaceHat
	{
		constructor(private readonly options: ISurfaceOptions)
		{
			this.head = Hot.div(options.class || "",
				UI.fixed(-10),
				{
					padding: "40px",
					opacity: 0,
					transitionDuration: "0.5s",
					transitionProperty: "opacity, transform",
					maxHeight: "calc(100% + 20px)",
					overflow: "auto",
					
					...(!options.background ? {} : {
						borderRadius: "10px",
						backgroundColor: options.background,
						transform: UI.translateZ(-100),
					})
				},
				...options.params || []
			);
			
			When.rendered(this.head, () =>
			{
				this.head.style.opacity = "1";
				this.head.style.transform = UI.translateZ(0);
			});
			
			const fgcolor = options.background === "white" ? "black" : "white";
			
			if (options.closeOnEscape)
			{
				this.head.addEventListener("keydown", ev =>
				{
					if (ev.key === "Escape")
						this.close();
				});
				
				this.head.tabIndex = -1;
			}
			
			if (options.closeFn)
			{
				const closer = Hot.div(
					"closer",
					{
						position: "fixed",
						zIndex: 9,
						top: "30px",
						right: "30px",
						color: fgcolor,
						cursor: "pointer",
						userSelect: "none",
						fontSize: "30px",
					});
				
				closer.textContent = UI.mul;
				closer.addEventListener(UI.clickEvt, () => this.close());
				
				When.connected(this.head, () =>
				{
					this.head.insertAdjacentElement("afterend", closer);
				});
				
				When.disconnected(this.head, () => closer.remove());
			}
			
			const accepter = Hot.div(
				"accepter",
				{
					position: "fixed",
					bottom: "30px",
					right: "30px",
					zIndex: 9,
					color: fgcolor,
					cursor: "pointer",
					userSelect: "none",
					fontSize: "30px",
				});
			
			accepter.addEventListener(UI.clickEvt, () =>
			{
				this.close("accept");
			});
			
			When.connected(this.head, () =>
			{
				this.head.insertAdjacentElement("afterend", accepter);
			});
			
			When.disconnected(this.head, () => accepter.remove());
			
			if (options.class)
				this.head.classList.add(options.class);
			
			Hat.wear(this);
		}
		
		readonly head: HTMLElement;
		
		/** */
		close(accept?: "accept")
		{
			const s = this.head.style;
			s.transform = UI.translateZ(-100);
			s.opacity = "0";
			UI.disconnectAfterTransition(this.head);
			
			if (accept)
				this.options.acceptFn();
			
			else if (typeof this.options.closeFn === "function")
				this.options.closeFn();
		}
	}
}
