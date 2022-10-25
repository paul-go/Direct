
namespace App
{
	/**
	 * Emits the manifest.json used by Android.
	 */
	export class ManifestJsonEmitter
	{
		/** */
		targetPath = "/";
		
		/** */
		emit()
		{
			return JSON.stringify({
				name: "App",
				icons: [
					this.createIcon(36, 0.75),
					this.createIcon(48, 1.0),
					this.createIcon(72, 1.5),
					this.createIcon(96, 2.0),
					this.createIcon(144, 3.0),
					this.createIcon(192, 4.0),
				]
			})
		}
		
		/** */
		private createIcon(size: number, density: number)
		{
			return {
				src: RenderUtil.getFaviconUrl(this.targetPath),
				sizes: size + "x" + size,
				type: "image\\/png",
				density: density.toString()
			};
		}
	}
}
