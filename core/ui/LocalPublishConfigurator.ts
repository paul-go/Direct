
namespace Turf
{
	/** */
	export class LocalPublishConfigurator extends PublishConfigurator
	{
		/** */
		static readonly description = "Publish to my device.";
		
		/** */
		constructor(meta: MetaRecord)
		{
			super(meta);
			
			this.saveLocationInput = new InputView("Save to", { disabled: true });
			
			Htx.from(this.contents)(
				this.saveLocationInput.root,
				UI.createPublishButton("Change Save Location", () => this.changeSaveLocation()),
				() =>
				{
					const publisher = this.getPublisher();
					const settings = publisher.getSettings();
					this.saveLocationInput.input.value = settings.folder;
				}
			);
		}
		
		readonly publisherType = LocalPublisher;
		private readonly saveLocationInput;
		
		/** */
		private async changeSaveLocation()
		{
			const publisher = this.getPublisher();
			let saveFolder = publisher.getSettings().folder;
			
			if (ELECTRON)
			{
				saveFolder = getExportsFolder();
			}
			else if (TAURI)
			{
				const dialogResult = await Tauri.dialog.open({
					recursive: true,
					directory: true,
					multiple: false,
					defaultPath: saveFolder || undefined
				});
				
				if (typeof dialogResult === "string")
					saveFolder = dialogResult;
			}
			
			this.saveLocationInput.input.value = saveFolder;
			publisher.setSettings(saveFolder);
		}
	}
	
	PublishConfigurator.register(LocalPublishConfigurator);
}
