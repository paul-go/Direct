
namespace App
{
	/** */
	export class PostHat
	{
		/**
		 * Returns the active PostHat that exists near the specified Node or Hat.
		 */
		static find(via: Node | Hat.IHat)
		{
			const hat = Not.nullable(Hat.nearest(via, PostHat));
			return hat.record.isHomePost ? Hat.down(hat, PostHat) || hat : hat;
		}
		
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
			
			Hat.wear(this);
		}
		
		readonly scenes;
		private readonly scenesElement;
		private readonly noScenesBox;
		
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
