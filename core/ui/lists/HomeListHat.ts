/// <reference path="ListHat.ts" />

namespace App
{
	/** */
	export class HomeListHat extends ListHat<EditorRectangleHat>
	{
		/** */
		constructor()
		{
			super();
			
			this.purview.handlePreviewRequest(request =>
			{
				const postStream = AppContainer.of(this).blog.postStream;
				const rectangles: EditorRectangleHat[] = [];
				const futures = postStream.query(request.rangeStart, request.rangeEnd);
				
				for (const future of futures)
				{
					const rectangle = new EditorRectangleHat();
					rectangle.setRecords(future);
					rectangles.push(rectangle);
				}
				
				return rectangles;
			});
			
			this.purview.handleReviewRequest(async rectangle =>
			{
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
		}
	}
}
