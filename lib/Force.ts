
namespace Force
{
	/**
	 * Creates and returns a pair of force functions that handle the
	 * arguments as specified in the type parameter.
	 * The first function is used to retain callback functions that
	 * are triggered when the second function is invoked,
	 */
	export function create<TFormat extends (...args: any[]) => void = () => void>()
	{
		type TExecutor = (...data: Parameters<TFormat>) => void;
		type TConnector = ((callback: TFormat) => void) & { off(callback: TFormat): void };
		const fo = new ForceObject<TFormat>();
		
		return [fo.connectorFn, fo.executorFn] as any as [
			TConnector,
			TExecutor,
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
