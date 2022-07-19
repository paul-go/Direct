/// <reference path="./ui/AppContainer.ts" />

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
	}
	
	/** */
	export async function createApp(options?: ICreateAppOptions)
	{
		const database = await createDatabase(options?.database ? 
			options.database :
			ConstS.homeDatabaseName);
		
		Turf.appendCss();
		const container = options?.container ?? document.body;
		const app = await AppContainer.new(container, database);
		
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
		return Turf.Back.new(name,
			{ ctor: Turf.MetaRecord, stable: 1 },
			{ ctor: Turf.PatchRecord, stable: 2 },
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
