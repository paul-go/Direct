
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
			const meta = await getDatabaseMeta(database);
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
		async importBlogFile(blogFile: FileLike)
		{
			const bytes = new Uint8Array(blogFile.data);
			const databaseAbout = await BlogFile.parse(bytes);
			
			if (!databaseAbout)
				return void await Util.alert(`This .zip archive wasn't exported from ${ConstS.appName}.`);
			
			this._database = await App.createDatabase(databaseAbout);
			this._meta = await getDatabaseMeta(this.database);
			this.root.replaceChildren(new App.BlogView().root);
		}
		
		/** */
		async restartFromScratch()
		{
			await Database.clear();
			localStorage.clear();
			window.location.reload();
		}
	}
	
	/** */
	async function getDatabaseMeta(database: Database)
	{
		let meta = await database.first(MetaRecord);
		if (!meta)
			meta = new MetaRecord();
		
		if (!meta.homePost)
			meta.homePost = new PostRecord();
		
		await database.save(meta);
		return meta;
	}
}
