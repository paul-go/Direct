
namespace App
{
	/** */
	export class DevicePublisher extends AbstractPublisher
	{
		/** */
		readonly name = "Device";
		
		/** */
		async tryPublish(showConfig: boolean)
		{
			if (!this.folder)
			{
				this.folder = await this.requestSaveFolder();
				
				// Cancel
				if (!this.folder)
					return undefined;
			}
			
			if (showConfig)
				return this.getConfigurator();
			
			this.beginPublish();
			return null;
		}
		
		/** */
		private getConfigurator()
		{
			return Hot.div(
				"device-publisher-config",
				MainMenuHat.getWindowStyle(),
				{
					padding: "30px",
					fontSize: "30px",
					fontWeight: 700,
				},
				Hot.css("> *", {
					margin: "20px 10px",
				}),
				Hot.css("> :first-child", {
					marginTop: "10px",
				}),
				Hot.css("> :last-child", {
					marginBottom: "10px",
				}),
				Hot.div(new Text("Publish Folder")),
				this.saveLocationElement = Hot.div(
					{
						padding: "15px",
						margin: "20px 0",
						border: "3px solid " + UI.gray(70),
						borderRadius: UI.borderRadius.default,
						backgroundColor: "black",
						lineHeight: 1.5,
						wordBreak: "break-all",
						fontSize: "20px",
					},
					Hot.css("&:empty", {
						display: "none"
					}),
					UI.text(this.folder, 20)
				),
				
				UI.actionButton("filled",
					UI.click(async () => this.folder = await this.requestSaveFolder()),
					new Text("Change Publish Folder")
				),
				UI.actionButton("filled",
					UI.click(() => this.beginPublish()),
					new Text("Publish")
				),
			);
		}
		
		private saveLocationElement: HTMLElement | null = null;
		
		/** */
		get folder()
		{
			return this.getPublishParam("folder", "");
		}
		set folder(folder: string)
		{
			this.setPublishParam("folder", folder);
			
			if (this.saveLocationElement)
				this.saveLocationElement.textContent = folder;
		}
		
		/** */
		private async requestSaveFolder()
		{
			let saveFolder = "";
			
			if (ELECTRON)
			{
				const exportsFolder = getExportsFolder();
				const result = confirm("Set save location to exports folder?");
				
				if (result)
					saveFolder = exportsFolder;
			}
			else if (TAURI)
			{
				const dialogResult = await Tauri.dialog.open({
					recursive: true,
					directory: true,
					multiple: false,
					defaultPath: saveFolder || undefined // Prevents Tauri crash
				});
				
				if (typeof dialogResult === "string")
					saveFolder = dialogResult;
			}
			
			return saveFolder;
		}
		
		/** */
		beginPublish()
		{
			
		}
		
		/** */
		protected async executePublish(files: IRenderedFile[])
		{
			for (const file of files)
			{
				const folderPath = await Util.pathJoin(this.folder, file.folderName);
				const filePath = await Util.pathJoin(folderPath, file.fileName);
				
				if (TAURI)
				{
					await Tauri.fs.createDir(folderPath, { recursive: true });
					
					typeof file.data === "string" ?
						await Tauri.fs.writeFile(filePath, file.data) :
						await Tauri.fs.writeBinaryFile(filePath, file.data);
				}
				else if (ELECTRON)
				{
					const payload = typeof file.data === "string" ?
						file.data : 
						Buffer.from(file.data);
					
					if (!Electron.fs.existsSync(folderPath))
						Electron.fs.mkdirSync(folderPath, { recursive: true });
					
					Electron.fs.writeFileSync(filePath, payload);
				}
			}
			
			return "";
		}
	}
	
	setTimeout(() => Publishers.register(DevicePublisher, 1));
}
