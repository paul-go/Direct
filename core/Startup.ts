
namespace Turf
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
			Turf.Util.include("trix.js"),
			new Promise<void>(async r =>
			{
				if (DEBUG && options?.clear)
					await Turf.Database.delete(dbName);
				
				const database = await createDatabase(dbName);
				
				Turf.appendCss();
				const container = options?.container ?? document.body;
				app = await AppContainer.new(container, database);
				r();
			})
		]);
		
		if (options?.shell !== true)
		{
			const view = new Turf.PatchView(app.homePatch);
			app.root.append(view.root);
		}
		
		return app;
	}
	
	/** */
	export function createDatabase(name: string)
	{
		return Turf.Database.new(name,
			{ ctor: Turf.MetaRecord, stable: 1, root: true },
			{ ctor: Turf.PatchRecord, stable: 2, root: true },
			{ ctor: Turf.CaptionedBladeRecord, stable: 3 },
			{ ctor: Turf.ProseBladeRecord, stable: 4 },
			{ ctor: Turf.VideoBladeRecord, stable: 5 },
			{ ctor: Turf.GalleryBladeRecord, stable: 6 },
			{ ctor: Turf.FrameRecord, stable: 7 },
			{ ctor: Turf.MediaRecord, stable: 8 },
			{ ctor: Turf.BackgroundRecord, stable: 9 },
		);
	}
	
	if (document.documentElement.hasAttribute("data-autostart"))
		setTimeout(() => createApp());
}
