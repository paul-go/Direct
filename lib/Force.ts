
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
		const callbacks: TFormat[] = [];
		
		const connector = (callback: TFormat) =>
		{
			callbacks.push(callback);
		};
		
		const executor = (...data: Parameters<TFormat>) =>
		{
			for (const callback of callbacks)
				callback(...data);
		};
		
		return [connector, executor] as [typeof connector, typeof executor];
	}
}
