
namespace App
{
	/** */
	export interface IStartOptions
	{
		databaseName?: string;
		appContainer?: HTMLElement;
		skipAppInit?: boolean;
	}
	
	/** */
	export interface ICreateAppOptions
	{
		database?: string;
		container?: HTMLElement;
		shell?: boolean;
		clear?: boolean;
	}
	
	/** */
	export async function createApp(options?: ICreateAppOptions)
	{
		const dbName = options?.database ? 
			options.database :
			ConstS.mainDatabaseName;
		
		let app: AppContainer = null!;
		
		// Do the database initialization stuff while we're loading the trix editor,
		// to improve load time where possible.
		await Promise.all([
			App.Util.include("trix.js"),
			new Promise<void>(async r =>
			{
				if (DEBUG && options?.clear)
					await App.Database.delete(dbName);
				
				const database = await createDatabase(dbName);
				
				App.appendCss();
				const container = options?.container ?? document.body;
				app = await AppContainer.new(container, database);
				r();
			})
		]);
		
		if (options?.shell !== true)
		{
			const view = new App.PostView(app.homePost);
			app.root.append(view.root);
		}
		
		return app;
	}
	
	/** */
	export function createDatabase(name: string)
	{
		return App.Database.new(name,
			{ ctor: App.MetaRecord, stable: 1, root: true },
			{ ctor: App.PostRecord, stable: 2, root: true },
			{ ctor: App.CaptionedSceneRecord, stable: 3 },
			{ ctor: App.ProseSceneRecord, stable: 4 },
			{ ctor: App.VideoSceneRecord, stable: 5 },
			{ ctor: App.GallerySceneRecord, stable: 6 },
			{ ctor: App.FrameRecord, stable: 7 },
			{ ctor: App.MediaRecord, stable: 8 },
			{ ctor: App.BackgroundRecord, stable: 9 },
		);
	}
	
	if (document.documentElement.hasAttribute("data-autostart"))
		setTimeout(() => createApp());
}
