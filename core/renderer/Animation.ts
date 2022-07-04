
namespace Turf
{
	/** */
	export type PainterFn<T = {}> = (data: IPainterData<T>) => void;
	
	/** */
	export interface IPainterData<T>
	{
		progress: number;
		element: HTMLElement;
		parameters: { [P in keyof T]: boolean; };
	}
	
	/** */
	export class Animation<T = {}>
	{
		/** */
		static fromName(name: string): Animation
		{
			const tEntry = Object.entries(Transitions).find(([n]) => n === name);
			if (tEntry)
				return tEntry[1];
			
			const eEntry = Object.entries(Effects).find(([n]) => n === name);
			if (eEntry)
				return eEntry[1];
			
			throw "Unknown transition: " + name;
		}
		
		/** */
		constructor(painter: PainterFn);
		constructor(parameters: T, painter: PainterFn<T>);
		constructor(a: any, b?: any)
		{
			this.parameters = b ? a : {};
			this.painter = b || a;
		}
		
		/** */
		readonly parameters: T;
		
		/** */
		readonly painter: PainterFn;
		
		/** */
		get name(): string
		{
			if (this._name)
				return this._name;
			
			const tEntry = Object.entries(Transitions).find(([, value]) => value === this);
			if (tEntry)
				return this._name = tEntry[0];
			
			const eEntry = Object.entries(Effects).find(([, value]) => value === this);
			if (eEntry)
				return this._name = eEntry[0];
			
			return "";
		}
		private _name: string = "";
		
		/** */
		private toJSON()
		{
			return this.name;
		}
	}
	
	/** */
	export namespace Transitions
	{
		/** */
		export const slide = new Animation(data =>
		{
			
		});
		
		/** */
		export const curtain = new Animation(data =>
		{
			
		});
		
		/** */
		export const emerge = new Animation(data =>
		{
			
		});
		
		const wipeParameters = {
			left: "From Left",
			right: "From Right",
			bottomLeft: "From Bottom Left",
			bottom: "From Bottom",
			bottomRight: "From Bottom Right",
		};
		
		/** */
		export const wipe = new Animation(wipeParameters, data =>
		{
			
		});
		
		/** */
		export const cross = new Animation(data =>
		{
				
		});
		
		/** */
		export const black = new Animation(data =>
		{
			
		});
		
		/** */
		export const brightness = new Animation(data =>
		{
			
		});
		
		/** */
		export const circle = new Animation(data =>
		{
			
		});
	}
	
	/** */
	export namespace Effects
	{
		/** */
		export const none = new Animation(data =>
		{
			
		});
		
		const fadeParameters = {
			up: "Up",
			left: "Left",
			right: "Right",
		};
		
		/** */
		export const fade = new Animation(fadeParameters, data =>
		{
			
		});
		
		/** */
		export const blur = new Animation(data =>
		{
			
		});
		
		/** */
		export const expand = new Animation(data =>
		{
			
		});
	}
}
