
namespace App
{
	/** */
	export class EditorRectangleHat extends Player.RectangleHat
	{
		/**
		 * For reasons that cannot be explained, this property needs to
		 * be positioned at the top of this class, otherwise, the debugger
		 * breaks when stepping into it (don't waste time trying to figure
		 * this out...)
		 */
		private future: PostStreamRecordFuture | null = null;
		
		/** */
		async setRecords(future: PostStreamRecordFuture)
		{
			this.future = future;
			const scene = await future.getScene();
			const renderer = SceneRenderer.create(scene, true);
			const section = this.html = await renderer.render();
			const width = 0;
			const height = 0;
			const ctx = await Render.rasterizeHtml(section, width, height);
			const blob = await new Promise<Blob | "">(r =>
				ctx.canvas.toBlob(blob => r(blob || ""), "image/jpeg"));
			
			this.image = blob;
			this.setFidelity(this.fidelity || "performance");
			this._scene = scene;
		}
		
		/** */
		getScene()
		{
			return Not.nullable(this._scene);
		}
		private _scene: SceneRecord | null = null;
		
		/** */
		getPost()
		{
			if (this._post)
				return Promise.resolve(this._post);
			
			if (this.future)
				return this.future.getPost();
			
			Not.reachable();
		}
		private _post: PostRecord | null = null;
	}
}
