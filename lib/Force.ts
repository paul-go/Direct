
namespace Turf
{
	/** */
	type ForceUseMembers<T> = {
		[K in ForceMemberNames<T>]: () => void
	};
	
	/** */
	type ForceWatchMembers<T> = {
		[K in ForceMemberNames<T>]: (callbackFn: () => void) => void
	};
	
	/** */
	type ForceMemberNames<T> = {
		[K in keyof T]: T[K] extends Force ? K : never
	}[keyof T];
	
	/** */
	export class Force
	{
		/** */
		static use<T extends Constructor<Controller.IController>>(
			via: Controller.IController | HTMLElement,
			ctor: T): ForceUseMembers<InstanceType<T>>
		{
			const ctrl = Controller.over(via, ctor);
			const entries: [string, () => void][] = []
			
			for (const [key, value] of Object.entries(ctrl))
				if (value instanceof Force)
					entries.push([key, () => value.use()]);
			
			return Object.fromEntries(entries) as any;
		}
		
		/** */
		static watch<T extends Constructor<Controller.IController>>(
			via: Controller.IController | HTMLElement,
			ctor: T): ForceWatchMembers<InstanceType<T>>
		{
			const ctrl = Controller.over(via, ctor);
			const entries: [string, (callbackFn: () => void) => void][] = []
			
			for (const [key, value] of Object.entries(ctrl))
			{
				if (value instanceof Force)
				{
					const fn = (callbackFn: () => void) => value.watch(callbackFn);
					entries.push([key, fn]);
				}
			}
			
			return Object.fromEntries(entries) as any;
		}
		
		/** */
		constructor() { }
		
		/** */
		use()
		{
			for (const fn of this.fns.slice())
				fn();
		}
		
		/** */
		watch(fn: () => void)
		{
			this.fns.push(fn);
		}
		
		/** */
		unwatch(fn: () => void)
		{
			for (let i = this.fns.length; i-- > 0;)
				if (this.fns[i] === fn)
					this.fns.splice(i, 1);
		}
		
		private readonly fns: (() => void)[] = [];
	}
}
