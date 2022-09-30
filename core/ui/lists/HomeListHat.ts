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
				this.purview = new Player.Purview(),
			);
			
			this.purview.size = size;
			this.purview.enableKeyboardSizing = false;
			
			this.purview.handlePreviewRequest(request =>
			{
				const postStream = AppContainer.of(this).blog.postStream;
				const rectangles: Player.RectangleHat[] = [];
				const futures = postStream.query(request.rangeStart, request.rangeEnd);
				
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
			
			this.purview.handleReviewRequest(async rectangle =>
			{
				if (!(rectangle instanceof EditorRectangleHat))
					return;
				
				const app = AppContainer.of(this);
				const post = await rectangle.getPost();
				
				if (app.inEditMode)
					return new PostHat(post).head;
				
				const postRenderer = new PostRenderer(post, app.blog);
				const renderResult = await postRenderer.render(true);
				const scenery = new Player.Scenery();
				scenery.insert(...renderResult.scenes);
				return scenery;
			});
			
			When.connected(this.purview.head, () =>
			{
				this.purview.gotoPreviews();
			});
			
			Hat.wear(this);
		}
		
		/** */
		readonly purview;
		
		/** */
		private createFakePost()
		{
			const hat = new Player.RectangleHat();
			
			hat.setHtml(Hot.div(
				UI.flexVCenter,
				Player.RectangleHat.defaultBackground,
				{
					justifyContent: "center",
					width: "100%",
					height: "100%",
					fontSize: "40vw",
					fontWeight: 700,
					color: "rgba(255, 255, 255, 0.125)",
				},
				new Text("?"),
			));
			
			return hat;
		}
	}
	
	const size = 3;
}
