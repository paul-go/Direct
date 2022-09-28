
namespace Cover
{
	/** */
	export async function coverRasterizer()
	{
		await App.createApp({ shell: true, clear: true });
		const sceneRecord = Sample.createCanvasScene();
		sceneRecord.contentImage = Sample.createContentImage();
		
		const sceneRenderer = App.SceneRenderer.create(sceneRecord);
		const renderResult = await sceneRenderer.render();
		
		const blob = await Player.rasterize(renderResult, {
			cssRules: sceneRenderer.cssRules.map(r => r.toString())
		});
		
		const src = BlobUri.create(blob);
		const img = Hot.img({ src });
		document.body.append(img);
	}
}
