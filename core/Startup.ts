
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
				
				App.appendCss();
				const container = options?.container ?? document.body;
				app = await AppContainer.new(container, dbName);
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
	
	if (typeof document !== "undefined" && 
		document.documentElement.hasAttribute("data-autostart"))
		setTimeout(() => createApp());
}
