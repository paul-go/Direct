
namespace Turf
{
	/** */
	export class AppContainer
	{
		/** */
		static of(target: Element | Controller.IController)
		{
			return Controller.over(target, AppContainer);
		}
		
		/** */
		constructor(
			readonly root: HTMLElement,
			database: Back | null)
		{
			Htx.from(root)(
				CssClass.appRoot,
				{
					minHeight: "100%",
				}
			);
			
			this._database = database;
			
			Controller.set(this);
		}
		
		/** */
		get database()
		{
			if (!this._database)
				throw "Database not loaded.";
			
			return this._database;
		}
		private _database: Back | null = null;
		
		/** */
		get currentUser()
		{
			return this._currentUser;
		}
		private _currentUser: IUser | null = null;
		
		/** */
		get currentMeta()
		{
			if (this._currentMeta)
				return this._currentMeta;
			
			return this._currentMeta = new MetaRecord();
		}
		private _currentMeta: MetaRecord | null = null;
		
		/** */
		get currentMediaStore()
		{
			if (!this._currentMediaStore)
				this._currentMediaStore = new MediaStore("temp-turf-name");
			
			return this._currentMediaStore;
		}
		private _currentMediaStore: MediaStore | null = null;
	}
}
