
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
		
		if (options?.clear)
		{
			AppContainer.lastLoadedDatabase = "";
			await Store.clear();
			
			if (DEBUG)
				Key.reset();
		}
		
		let name: Partial<IBlogName>;
		
		if (options?.database)
			name = { friendlyName: options.database };
		
		else if (AppContainer.lastLoadedDatabase)
			name = { fixedName: AppContainer.lastLoadedDatabase };
		
		else
			name = { friendlyName: ConstS.mainDatabaseName };
		
		let app: AppContainer = null!;
		
		// Do the database initialization stuff while we're loading
		// the trix editor, to improve load time where possible.
		await Promise.all([
			App.Util.include("trix.js"),
			new Promise<void>(async resolve =>
			{
				Css.append();
				await Blog.init();
				const container = options?.container ?? document.body;
				app = await AppContainer.new(container, name);
				resolve();
			})
		]);
		
		if (options?.shell !== true)
			app.reset();
		
		ModificationListener.startup();
		return app;
	}
	
	if (TAURI ||
		(typeof document !== "undefined" && 
		document.body.classList.contains(ConstS.launchAppClass)))
		setTimeout(() => createApp());
}
