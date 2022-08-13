
namespace Cover
{
	/** */
	export async function coverBlogView()
	{
		await App.createApp({ shell: true });
		const db = await App.createDatabase({ name: "coverBlogView" });
		const posts: App.PostRecord[] = [];
		
		for (let i = -1; ++i < 20;)
		{
			const post = new App.PostRecord();
			
			if (i % 4 !== 0)
				post.datePublished = Date.now();
			
			posts.push(post);
		}
		
		await db.save(...posts);
		Cover.display(new App.BlogView());
	}
}
