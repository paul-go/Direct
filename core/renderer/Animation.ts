
namespace App
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
		constructor(label: string, painter: PainterFn);
		constructor(label: string, parameters: T, painter: PainterFn<T>);
		constructor(label: string, a: any, b?: any)
		{
			this.label = label;
			this.parameters = b ? a : {};
			this.painter = b || a;
		}
		
		/** */
		readonly label: string;
		
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
	}
	
	/** */
	export namespace Transitions
	{
		/** */
		export const slide = new Animation("None", data =>
		{
			
		});
		
		/** */
		export const curtain = new Animation("Curtain", data =>
		{
			
		});
		
		/** */
		export const emerge = new Animation("Emerge", data =>
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
		export const wipe = new Animation("Wipe", wipeParameters, data =>
		{
			
		});
		
		/** */
		export const cross = new Animation("Cross Fade", data =>
		{
				
		});
		
		/** */
		export const black = new Animation("Fade Through Black", data =>
		{
			
		});
		
		/** */
		export const brightness = new Animation("Fade Through Brightness", data =>
		{
			
		});
		
		/** */
		export const circle = new Animation("Circle Wipe", data =>
		{
			
		});
	}
	
	/** */
	export namespace Effects
	{
		/** */
		export const none = new Animation("None", data =>
		{
			
		});
		
		const fadeParameters = {
			up: "Up",
			left: "Left",
			right: "Right",
		};
		
		/** */
		export const fade = new Animation("Fade", fadeParameters, data =>
		{
			
		});
		
		/** */
		export const blur = new Animation("Blur", data =>
		{
			
		});
		
		/** */
		export const expand = new Animation("Expand Letters", data =>
		{
			
		});
	}
}
