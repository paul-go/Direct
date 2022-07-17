
namespace Turf
{
	/** */
	export class AppContainer
	{
		/** */
		static of(target: Element | Controller.IController)
		{
			return Controller.over(target, AppContainer as any as new() => AppContainer);
		}
		
		/** */
		static async new(root: HTMLElement, database: Back)
		{
			const container = new AppContainer(root, database);
			const meta = await database?.first?.(MetaRecord) ?? new MetaRecord();
			const homePatch = meta.homePatch || (meta.homePatch = new PatchRecord());
			Object.assign(container, { meta, homePatch } as Partial<AppContainer>);
			return container;
		}
		
		/** */
		private constructor(
			readonly root: HTMLElement,
			readonly database: Back)
		{
			Htx.from(root)(
				CssClass.appRoot,
				{
					minHeight: "100%",
				}
			);
			
			Controller.set(this);
		}
		
		/** */
		readonly meta: MetaRecord = {} as any;
		
		/** */
		readonly homePatch: PatchRecord = {} as any;
	}
}
