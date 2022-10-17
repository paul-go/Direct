
namespace App
{
	/** */
	export class PostHat
	{
		readonly head;
		
		/**
		 * Creates a new PostHat instance, which is populated with data
		 * from the specified PostRecord. If the PostRecord argument is
		 * omitted, this indicates that this PostHat should create it a new, 
		 * unsaved record.
		 */
		constructor(readonly record = new PostRecord())
		{
			this._isKeepingRecord = !!record;
			const minHeight: Hot.Param = { minHeight: record.isHomePost ? "85vh" : "100vh" };
			
			this.head = Hot.div(
				"post-hat",
				{
					backgroundColor: UI.darkGrayBackground,
				},
				Hot.div(
					"post-hat-width",
					UI.editorMaxWidth(),
					{
						transitionDuration: "0.5s",
						transitionProperty: "transform, opacity",
						transformOrigin: "0 0",
						opacity: 1,
					},
					minHeight,
					!record.isHomePost && Hot.div(
						"exit-chevron",
						{
							position: "sticky",
							width: 0,
							height: 0,
							left: 0,
							right: 0,
							margin: "auto",
							zIndex: 3,
						},
						Hot.div(
							{
								width: "64px",
								height: "64px",
								left: "-32px",
								paddingTop: "48px",
							},
							Icon.chevron(Origin.top, {
								margin: "auto",
							}),
							UI.click(() => this._exitFn()),
						)
					),
					this.scenesElement = Hot.div(
						"scenes-element",
						minHeight,
						
						Hot.css("> :last-child", {
							paddingBottom: record.isHomePost ? "50px" : "33vh"
						}),
					),
					Hot.div(
						"no-scenes-message",
						UI.anchor(),
						UI.flexCenter,
						UI.visibleWhenEmpty(this.scenesElement),
						minHeight,
						{
							zIndex: 1,
						},
						(this.noScenesBox = new HeightBox(this.renderNoScenes())).head,
					)
				)
			);
			
			this.scenes = new Hat.Array(this.scenesElement, SceneHat);
			this.scenes.insert(...this.record.scenes.map(b => SceneHat.new(b)));
			this.scenes.observe(async () =>
			{
				await this.save();
				AppContainer.of(this).blog.postStream.update(this.record);
			});
			
			const fns = Force.create();
			[this.exitFn, this._exitFn] = fns;
			
			if (!this.record.isHomePost)
				this.exitFn(() => Hat.up(this, Player.Omniview)?.gotoPreviews());
			
			Hat.wear(this);
		}
		
		readonly scenes;
		private readonly scenesElement;
		private readonly noScenesBox;
		
		readonly exitFn;
		private readonly _exitFn;
		
		/** */
		private renderNoScenes()
		{
			return Hot.div(
				"add-first-scene",
				Hot.div(
					UI.presentational,
					{
						fontSize: "30px",
						fontWeight: 600,
						marginBottom: "30px",
					},
					new Text("This post has no scenes."),
				),
				UI.actionButton("filled", 
					{
						marginTop: "10px",
					},
					Hot.on(UI.clickEvt, () =>
					{
						const ibv = new InsertSceneHat("v");
						ibv.setCancelCallback(() => this.noScenesBox.back());
						ibv.setInsertCallback(scene =>
						{
							this.scenesElement.append(scene.head);
						});
						this.noScenesBox.push(ibv.head);
					}),
					new Text("Add One"),
				)
			);
		}
		
		/** */
		get isKeepingRecord()
		{
			return this._isKeepingRecord;
		}
		private _isKeepingRecord = false;
		
		/** */
		private async save()
		{
			this._isKeepingRecord = true;
			this.record.scenes = this.scenes.map(hat => hat.record);
			await AppContainer.of(this).blog.retainPost(this.record);
			this.record.dateModified = Date.now();
		}
	}
}
