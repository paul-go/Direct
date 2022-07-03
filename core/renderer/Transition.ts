
namespace Turf
{
	/** */
	export interface ITransitionMembers
	{
		readonly name: string;
		readonly reveals?: Ninth;
		readonly painter: (e1: HTMLElement, e2: HTMLElement, progress: number) => void;
	}
	
	/** */
	export class Transition
	{
		/** */
		static fromName(name: string)
		{
			const transition = this.all.get(name);
			if (!name)
				throw "Unknown transition: " + name;
			
			return transition;
		}
		
		/** */
		private static all = new Map<string, Transition>();
		
		/** */
		constructor(private readonly members: ITransitionMembers)
		{
			Transition.all.set(members.name, this);
		}
		
		/** */
		get name() { return this.members.name; }
		
		/** */
		get reveals() { return this.members.reveals || 0; }
		
		/** */
		get painter() { return this.members.painter; }
		
		/** */
		private toJSON()
		{
			return this.members.name;
		}
	}
	
	/** */
	export namespace Transitions
	{
		/** */
		export const cross = new Transition({
			name: "cross",
			reveals: 0,
			painter: (e1, e2, progress) =>
			{
				
			}
		});
	}
}
