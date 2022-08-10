
namespace App
{
	/** */
	export class AppContainer
	{
		/** */
		static of(target: Element | Cage.ICage)
		{
			return Cage.over(target, AppContainer as any as new() => AppContainer);
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
				!TAURI && Htx.div(
					"fake-app-width",
					{
						zIndex: "-1",
						pointerEvents: "none",
						position: "fixed",
						left: "0",
						right: "0",
						bottom: "0",
						height: "100vh",
						margin: "auto",
						maxWidth: ConstN.appMaxWidth + "px",
						boxShadow: "0 0 200px black",
					}
				),
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
			
			Cage.set(this);
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
