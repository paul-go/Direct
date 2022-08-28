
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
		{
			// This value is set in a find/replace process in the build
			// process. Do not alter this code.
			const consoleWelcomeMessage = "";
			if (consoleWelcomeMessage)
				console.log(consoleWelcomeMessage);
		}
		
		let about: IDatabaseAbout;
		
		if (options?.database)
			about = { name: options.database };
		
		else if (AppContainer.lastLoadedDatabase)
			about = { id: AppContainer.lastLoadedDatabase };
		
		else
			about = { name: ConstS.mainDatabaseName };
		
		let app: AppContainer = null!;
		
		// Do the database initialization stuff while we're loading
		// the trix editor, to improve load time where possible.
		await Promise.all([
			App.Util.include("trix.js"),
			new Promise<void>(async r =>
			{
				if (DEBUG && options?.clear && about.name)
					await App.Database.delete(about.name);
				
				Css.append();
				const container = options?.container ?? document.body;
				app = await AppContainer.new(container, about);
				r();
			})
		]);
		
		if (options?.shell !== true)
		{
			const hat = new App.PostHat(app.homePost);
			app.head.append(hat.head);
		}
		
		return app;
	}
	
	if (typeof document !== "undefined" && 
		document.documentElement.hasAttribute("data-autostart"))
		setTimeout(() => createApp());
}
