
namespace Turf
{
	/** */
	export class ApexView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				CssClass.appRoot,
				{
					minHeight: "100%",
				}
			);
			
			Controller.set(this);
		}
		
		readonly root;
		
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
