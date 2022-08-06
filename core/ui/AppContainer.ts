
namespace App
{
	/** */
	export class AppContainer
	{
		/** */
		static of(target: Element | Controller.IController)
		{
			return Controller.over(target, AppContainer as any as new() => AppContainer);
		}
		
		/** */
		static async new(root: HTMLElement, database: Database)
		{
			let meta = await database.first(MetaRecord);
			if (!meta)
			{
				meta = new MetaRecord();
				meta.homePost = new PostRecord();
				await database.save(meta);
			}
			
			return new AppContainer(root, database, meta);
		}
		
		/** */
		private constructor(
			readonly root: HTMLElement,
			readonly database: Database,
			readonly meta: MetaRecord)
		{
			Htx.from(root)(
				CssClass.appRoot,
				{
					minHeight: "100%",
				},
				TAURI && (e =>
				{
					const titleBar = Htx.div(
						"title-bar",
						UI.anchorTop(),
						{
							position: "fixed",
							height: "28px", // Title bar height, at least on macOS
							zIndex: "3",
							opacity: "0",
							backgroundColor: UI.gray(128, 0.33),
							transitionDuration: "0.25s",
							transitionProperty: "opacity",
						},
						UI.backdropBlur(8),
						Htx.css(":hover", { opacity: "1" })
					);
					
					titleBar.setAttribute("data-tauri-drag-region", "");
					e.prepend(titleBar)
				})
			);
			
			Controller.set(this);
		}
		
		/** */
		get homePost()
		{
			return Not.nullable(this.meta.homePost);
		}
		
		/** */
		async restartFromScratch()
		{
			await Database.clear();
			localStorage.clear();
			window.location.reload();
		}
	}
}
