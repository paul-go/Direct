
namespace Turf
{
	/** */
	export interface ISurfaceOptions
	{
		class?: string;
		background?: "black" | "white";
		closeOnEscape?: boolean;
		closeFn?: boolean | (() => void);
		acceptFn: () => void;
		params?: Htx.Param[];
	}
	
	/** */
	export namespace Surface
	{
		/** */
		export function open(options: ISurfaceOptions)
		{
			return new SurfaceController(options).root;
		}
		
		/** */
		export function close(surfaceElement: HTMLElement)
		{
			const ctl = Controller.get(surfaceElement, SurfaceController);
			ctl?.close();
		}
		
		/** */
		export function accept(surfaceElement: HTMLElement)
		{
			const ctl = Controller.get(surfaceElement, SurfaceController);
			ctl?.close("accept");
		}
	}
	
	/** */
	class SurfaceController
	{
		constructor(private readonly options: ISurfaceOptions)
		{
			this.root = Htx.div(options.class || "",
				UI.fixed(-10),
				{
					padding: "40px",
					opacity: "0",
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
			
			Htx.defer(this.root, () =>
			{
				this.root.style.opacity = "1";
				this.root.style.transform = UI.translateZ(0);
			});
			
			const fgcolor = options.background === "white" ? "black" : "white";
			
			if (options.closeOnEscape)
			{
				this.root.addEventListener("keydown", ev =>
				{
					if (ev.key === "Escape")
						this.close();
				});
				
				this.root.tabIndex = -1;
			}
			
			if (options.closeFn)
			{
				const closer = Htx.div(
					"closer",
					{
						position: "fixed",
						zIndex: "9",
						top: "30px",
						right: "30px",
						color: fgcolor,
						cursor: "pointer",
						userSelect: "none",
						fontSize: "30px",
					});
				
				closer.textContent = UI.mul;
				closer.addEventListener(UI.clickEvt, () => this.close());
				
				Htx.defer(this.root, () =>
				{
					this.root.insertAdjacentElement("afterend", closer);
				});
				
				UI.removeTogether(this.root, closer);
			}
			
			const accepter = Htx.div(
				"accepter",
				{
					position: "fixed",
					bottom: "30px",
					right: "30px",
					zIndex: "9",
					color: fgcolor,
					cursor: "pointer",
					userSelect: "none",
					fontSize: "30px",
				});
			
			accepter.addEventListener(UI.clickEvt, () =>
			{
				this.close("accept");
			});
			
			Htx.defer(this.root, () =>
			{
				this.root.insertAdjacentElement("afterend", accepter);
			});
			
			UI.removeTogether(this.root, accepter);
			
			if (options.class)
				this.root.classList.add(options.class);
			
			Controller.set(this);
		}
		
		readonly root: HTMLElement;
		
		/** */
		close(accept?: "accept")
		{
			const s = this.root.style;
			s.transform = UI.translateZ(-100);
			s.opacity = "0";
			UI.disconnectAfterTransition(this.root);
			
			if (accept)
				this.options.acceptFn();
			
			else if (typeof this.options.closeFn === "function")
				this.options.closeFn();
		}
	}
}
