
namespace App
{
	/**
	 * A namespace of functions that manage whether
	 * the active blog has been modified.
	 */
	export namespace ModificationListener
	{
		/** */
		export function startup()
		{
			Model.watch(watchFn);
		}
		
		/** */
		function watchFn(object: object)
		{
			runCovertly(() =>
			{
				if (object instanceof PostRecord)
					object.dateModified = Date.now();
				
				else for (const post of Model.ownersOf(object, PostRecord))
					post.dateModified = Date.now();
			});
		}
		
		/**
		 * Runs the specified function, potentially making changes
		 * to the model, without affecting the modification status
		 * of any containing PostRecord.
		 */
		export function runCovertly(fn: () => void)
		{
			Model.watch.off(watchFn);
			fn();
			Model.watch(watchFn);
		}
	}
}
