
namespace Force
{
	/**
	 * Creates and returns a pair of force functions that handle the
	 * arguments as specified in the type parameter.
	 * The first function is used to retain callback functions that
	 * are triggered when the second function is invoked,
	 */
	export function create<TFormat extends (...args: any[]) => void>()
	{
		const fo = new ForceObject<TFormat>();
		return [fo.connectorFn, fo.executorFn] as [
			(callback: TFormat) => void, 
			(...data: Parameters<TFormat>) => void,
		];
	}
	
	/** */
	class ForceObject<TFormat extends (...args: any[]) => void>
	{
		private readonly callbacks: TFormat[] = [];
		
		/** */
		readonly connectorFn = (callback: TFormat) =>
		{
			this.callbacks.push(callback);
		};
		
		/** */
		readonly executorFn = (...data: Parameters<TFormat>) =>
		{
			for (const callback of this.callbacks)
				callback(...data);
		};
	}
}
