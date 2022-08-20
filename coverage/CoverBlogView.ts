
namespace Cover
{
	/** */
	export async function coverBlogHat()
	{
		await App.createApp({ shell: true });
		const db = await App.createDatabase({ name: "coverBlogHat" });
		const posts: App.PostRecord[] = [];
		
		for (let i = -1; ++i < 20;)
		{
			const post = new App.PostRecord();
			
			if (i % 4 !== 0)
				post.datePublished = Date.now();
			
			posts.push(post);
		}
		
		await db.save(...posts);
		Cover.display(new App.BlogHat());
	}
}
