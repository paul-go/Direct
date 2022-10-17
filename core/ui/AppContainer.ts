
namespace App
{
	/** */
	export class AppContainer
	{
		/** */
		static of(target: Element | Hat.IHat)
		{
			return Hat.over(target, AppContainer as any as new() => AppContainer);
		}
		
		/** */
		static async new(head: HTMLElement, name: Partial<IBlogName>)
		{
			const blog = await Blog.new(name);
			const app = new AppContainer(head, blog);
			return app;
		}
		
		/**
		 * Gets or sets the fixed name of the last loaded database.
		 */
		static get lastLoadedDatabase()
		{
			return localStorage.getItem("last-loaded-database") || "";
		}
		static set lastLoadedDatabase(value: string)
		{
			localStorage.setItem("last-loaded-database", value);
		}
		
		/** */
		private constructor(readonly head: HTMLElement, blog: Blog)
		{
			this.setBlog(blog);
			
			Hot.get(head)(
				CssClass.appContainer,
				{
					minHeight: "100%",
				},
				TAURI && (e =>
				{
					const titleBar = Hot.div(
						"title-bar",
						UI.anchorTop(),
						{
							position: "fixed",
							height: "28px", // Title bar height, at least on macOS
							zIndex: 3,
							opacity: 0,
							backgroundColor: UI.gray(128, 0.33),
							transitionDuration: "0.25s",
							transitionProperty: "opacity",
						},
						UI.backdropBlur(8),
						Hot.css(":hover !", { opacity: 1 })
					);
					
					titleBar.setAttribute("data-tauri-drag-region", "");
					e.prepend(titleBar)
				}),
				
				!TAURI && Hot.on(window, "resize", () => window.requestAnimationFrame(() =>
				{
					this.toggleMaxClass();
				})),
				
				new MainMenuHat()
			);
			
			this.toggleMaxClass();
			Hat.wear(this);
		}
		
		/**
		 * Sets the AppContainer to its default state (with the HomeHat visible).
		 */
		reset()
		{
			this.head.append(new HomeHat(this).head);
		}
		
		/** */
		private toggleMaxClass()
		{
			const maxed = window.innerWidth >= ConstN.appMaxWidth;
			this.head.classList.toggle(CssClass.appContainerMaxed, maxed);
		}
		
		/** */
		inEditMode = true;
		
		/** */
		get blog()
		{
			return Not.nullable(this._blog);
		}
		private setBlog(blog: Blog)
		{
			AppContainer.lastLoadedDatabase = blog.fixedName;
			this._blog = blog;
		}
		private _blog: Blog | null = null;
		
		/** */
		async changeDatabase(fixedName: string)
		{
			const blog = Blog.get({ fixedName });
			if (!blog)
				return;
			
			this.head.replaceChildren();
			this.setBlog(blog);
			this.reset();
		}
		
		/** */
		async restartFromScratch()
		{
			await Store.clear();
			localStorage.clear();
			window.location.reload();
		}
	}
}
