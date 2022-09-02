
namespace App
{
	export namespace Store
	{
		/**
		 * Gets a reference to the internal Keyva instance used to access
		 * the global application database.
		 */
		export function current()
		{
			return keyva ||= new Keyva({
				indexes: Object.values(indexes)
			});
		}
		let keyva: Keyva | null = null;
		
		const friendlyName: keyof Blog = "friendlyName";
		const fixedName: keyof Blog = "fixedName";
		
		/** */
		export const indexes = {
			friendlyName,
			fixedName,
		};
		
		/**
		 * Clears all records from the database.
		 * Intended for use during DEBUG mode.
		 */
		export function clear()
		{
			return Store.current().delete();
		}
	}
}
