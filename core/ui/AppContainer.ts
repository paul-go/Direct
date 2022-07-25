
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
		static async new(root: HTMLElement, database: Database)
		{
			let meta = await database.first(MetaRecord);
			if (!meta)
			{
				meta = new MetaRecord();
				meta.homePatch = new PatchRecord();
				await database.save(meta);
			}
			
			return new AppContainer(root, database, meta);
		}
		
		/** */
		private constructor(
			readonly root: HTMLElement,
			readonly database: Database,
			readonly meta: MetaRecord)
		{
			let titleBar: HTMLElement;
			
			Htx.from(root)(
				CssClass.appRoot,
				{
					minHeight: "100%",
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
				),
			);
			
			titleBar.setAttribute("data-tauri-drag-region", "");
			Controller.set(this);
		}
		
		/** */
		get homePatch()
		{
			return Not.nullable(this.meta.homePatch);
		}
		
		/** */
		async publish(record: PatchRecord)
		{
			const publisher = Publisher.getCurrent(this.meta);
			if (!publisher?.canPublish())
			{
				const message = "You must setup your publish settings before doing this."
				
				if (TAURI)
					await Tauri.dialog.message(message);
				else
					alert(message);
				
				AppContainer.of(this).root.append(new SettingsView().root);
				return;
			}
			
			const files = [
				...(await Render.getPatchFiles(record, this.meta)),
				...(await Render.getSupportFiles()),
			];
			
			await publisher.publish(files);
		}
	}
}
