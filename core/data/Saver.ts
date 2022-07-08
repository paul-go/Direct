
namespace Turf
{
	/** */
	export interface ISaver
	{
		readonly root: Element;
		save(): void;
	}
	
	/** */
	export namespace Saver
	{
		/** */
		export function set(saver: ISaver)
		{
			saver.root.classList.add(saverClass);
			savers.set(saver.root, saver);
		}
		
		/** */
		export function execute(target: Element | ISaver)
		{
			const rootElement = target instanceof Element ? target : target.root;
			const elements = Query.find(saverClass, rootElement);
			
			if (rootElement instanceof HTMLElement)
				elements.push(rootElement);
			
			for (const element of elements)
			{
				const saver = savers.get(element);
				if (saver)
					saver.save();
			}
		}
		
		const saverClass = "__can_save__";
		const savers = new WeakMap<Element, ISaver>();
	}
}
