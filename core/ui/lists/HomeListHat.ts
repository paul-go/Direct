/// <reference path="ListHat.ts" />

namespace App
{
	/** */
	export class HomeListHat
	{
		readonly head;
		
		/** */
		constructor()
		{
			this.head = Hot.div(
				"home-list-hat",
				this.omniview = new Player.Omniview<EditorRectangleHat>(),
			);
			
			this.omniview.size = size;
			this.omniview.enableKeyboardSizing = false;
			
			this.omniview.handlePreviewRequest(request =>
			{
				const postStream = AppContainer.of(this).blog.postStream;
				const futures = postStream.query(request.rangeStart, request.rangeEnd);
				const rectangles: EditorRectangleHat[] = [];
				
				for (const future of futures)
				{
					const rectangle = new EditorRectangleHat();
					rectangle.setFutureRecord(future);
					rectangles.push(rectangle);
				}
				
				if (request.rangeStart === 0)
					for (let i = futures.length; i < size * size; i++)
						rectangles.push(this.createFakePost());
				
				return rectangles;
			});
			
			this.omniview.handleReviewRequest(async rectangle =>
			{
				if (!(rectangle instanceof EditorRectangleHat))
					return;
				
				const app = AppContainer.of(this);
				const post = await rectangle.getPost();
				if (!post)
					return;
				
				if (app.inEditMode)
					return new PostHat(post).head;
				
				const postRenderer = new PostRenderer(post, app.blog);
				const renderResult = await postRenderer.render(true);
				const scenery = new Player.Scenery();
				scenery.insert(...renderResult.scenes);
				return scenery;
			});
			
			When.connected(this.omniview.head, () =>
			{
				this.omniview.gotoPreviews();
			});
			
			Hat.wear(this);
		}
		
		/** */
		readonly omniview;
		
		/** */
		private createFakePost()
		{
			const hat = new EditorRectangleHat();
			
			hat.setHtml(Hot.div(
				UI.flexVCenter,
				Player.Omniview.defaultBackground,
				{
					justifyContent: "center",
					width: "100%",
					height: "100%",
					color: "rgba(255, 255, 255, 0.125)",
				},
				UI.text("?", "40vw", 700),
			));
			
			return hat;
		}
	}
	
	const size = 3;
}
