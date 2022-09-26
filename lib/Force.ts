
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
		type TConnector = ((callback: TFormat) => void) & { off(callback: TFormat): void };
		
		return [fo.connectorFn, fo.executorFn] as [
			TConnector,
			(...data: Parameters<TFormat>) => void,
		];
	}
	
	/** */
	class ForceObject<TFormat extends (...args: any[]) => void>
	{
		private readonly callbacks: TFormat[] = [];
		
		/** */
		readonly connectorFn = Object.assign(
			(callback: TFormat) => this.callbacks.push(callback),
			{ off: (callback: TFormat) => this.callbacks.splice(this.callbacks.indexOf(callback), 1) }
		);
		
		/** */
		readonly executorFn = (...data: Parameters<TFormat>) =>
		{
			for (const callback of this.callbacks)
				callback(...data);
		};
	}
}
