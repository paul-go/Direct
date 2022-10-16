
namespace App
{
	/** */
	export class EditorRectangleHat extends RectangleHat
	{
		/**
		 * For reasons that cannot be explained, this property needs to
		 * be positioned at the top of this class, otherwise, the debugger
		 * breaks when stepping into it (don't waste time trying to figure
		 * this out...)
		 */
		private future: PostStreamRecordFuture | null = null;
		
		/** */
		async setFutureRecord(future: PostStreamRecordFuture)
		{
			this.future = future;
			this.updateDraftStatus();
			const sceneRecord = await future.getScene();
			const renderer = SceneRenderer.new(sceneRecord, true);
			const sceneElement = await renderer.render();
			this.setHtml(sceneElement);
			this._scene = sceneRecord;
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
			
			return null;
		}
		private _post: PostRecord | null = null;
		
		/** */
		updateDraftStatus()
		{
			this.future?.getPartialPost().then(partial =>
			{
				this.isDraft = partial.isDraft;
			});
		}
		
		/** */
		get isDraft()
		{
			return !!this.draftChip;
		}
		private set isDraft(isDraft: boolean)
		{
			if (isDraft && this.draftChip === null)
			{
				this.head.append(
					this.draftChip = Hot.div(
						UI.anchorTop(15),
						{
							zIndex: 1,
							width: "max-content",
							margin: "auto",
							padding: UI.vw(0.5) + " " + UI.vw(1.5),
							borderRadius: UI.borderRadius.max,
							color: "white",
							fontSize: UI.vw(2),
							fontWeight: 700,
							backgroundColor: UI.themeColor,
						},
						new Text("Draft"),
					)
				);
			}
			else if (!isDraft && this.draftChip)
			{
				this.draftChip.remove();
				this.draftChip = null;
			}
		}
		private draftChip: HTMLElement | null = null;
	}
}
