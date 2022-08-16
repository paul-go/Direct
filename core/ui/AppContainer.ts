
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
		static async new(root: HTMLElement, databaseName: string)
		{
			const database = await App.createDatabase({ name: databaseName });
			const meta = await App.getDatabaseMeta(database);
			return new AppContainer(root, database, meta);
		}
		
		/** */
		private constructor(
			readonly root: HTMLElement,
			database: Database,
			meta: MetaRecord)
		{
			this._database = database;
			this._meta = meta;
			
			Htx.from(root)(
				
				CssClass.appContainer,
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
				}),
				
				Htx.on("keydown", ev =>
				{
					if (ev.key === "p" && ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey)
					{
						ev.preventDefault();
						this.showBlogPalette();
					}
				})
			);
			
			Cage.set(this);
		}
		
		/** */
		get database()
		{
			return this._database;
		}
		private _database: Database;
		
		/** */
		get meta()
		{
			return this._meta;
		}
		private _meta: MetaRecord;
		
		/** */
		get homePost()
		{
			return Not.nullable(this.meta.homePost);
		}
		
		/** */
		async changeDatabase(name: string)
		{
			const db = await App.getDatabase(name);
			if (!db)
				return;
			
			this.root.replaceChildren();
			this._database = db;
			this._meta = await App.getDatabaseMeta(db);
			this.root.append(new BlogView().root);
		}
		
		/** */
		showBlogPalette()
		{
			const pal = new BlogPalette();
			this.root.append(pal.root);
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
