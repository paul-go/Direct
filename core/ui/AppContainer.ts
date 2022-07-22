
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
			let titleBar: HTMLElement;
			
			Htx.from(root)(
				CssClass.appRoot,
				{
					minHeight: "100%",
					backgroundColor: UI.darkGrayBackground
				},
				titleBar = Htx.div(
					"title-bar",
					UI.anchorTop(),
					{
						position: "fixed",
						height: "28px", // Title bar height, at least on macOS
						zIndex: "3",
						opacity: "0",
						backgroundColor: UI.gray(128, 0.33),
						transitionDuration: "0.25s",
						transitionProperty: "opacity",
					},
					UI.backdropBlur(8),
					Htx.css(":hover", { opacity: "1" })
				)
			);
			
			titleBar.setAttribute("data-tauri-drag-region", "");
			Controller.set(this);
		}
		
		/** */
		readonly meta: MetaRecord = {} as any;
		
		/** */
		readonly homePatch: PatchRecord = {} as any;
		
		/** */
		getPublisher(): Publisher
		{
			return Publisher.getCurrent(this.meta);
		}
	}
}
