
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
		constructor(record?: PostRecord)
		{
			this.didCreateRecord = !record;
			if (!record)
				record = new PostRecord();
			
			this.record = record;
			const minHeight: Hot.Param = { minHeight: record.isHomePost ? "85vh" : "100vh" };
			
			this.head = Hot.div(
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
							top: 0,
							left: 0,
							zIndex: 3,
						},
						Hot.div(
							{
								width: "64px",
								height: "64px",
								padding: "48px",
							},
							Icon.chevron(Origin.top, {
								left: "-10px",
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
			this.scenes.insert(...record.scenes.map(b => SceneHat.new(b)));
			this.scenes.observe(() => this.save());
			
			const fns = Force.create();
			[this.exitFn, this._exitFn] = fns;
			
			if (!record.isHomePost)
			{
				this.exitFn(() => 
				{
					Hat.up(this, Player.Omniview)?.gotoPreviews();
				});
			}
			
			Hat.wear(this);
		}
		
		readonly scenes;
		readonly record;
		private readonly scenesElement;
		private readonly noScenesBox;
		private readonly didCreateRecord;
		
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
					new Text(this.record.isHomePost ?
						"Your home page has no scenes." :
						"This post has no scenes."),
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
		
		/**
		 * Gets whether a new PostRecord is being created by this PostHat,
		 * and whether that new PostRecord should be stored. Note that
		 * PostRecords shouldn't be stored unless at least a single scene
		 * has been added.
		 */
		get isStoringNewPost()
		{
			return this._isStoringNewPost;
		}
		private _isStoringNewPost = false;
		
		/** */
		private async save()
		{
			if (this.didCreateRecord)
				this._isStoringNewPost = true;
			
			const blog = AppContainer.of(this).blog;
			this.record.scenes = this.scenes.map(hat => hat.record);
			await blog.retainPost(this.record);
			this.record.dateModified = Date.now();
			blog.postStream.update(this.record);
		}
	}
}
