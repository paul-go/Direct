
namespace Cover
{
	/** */
	export async function coverBlogHat()
	{
		await App.createApp({ shell: true });
		const [blog] = await Sample.createBlog();
		
		for (let i = -1; ++i < 20;)
		{
			const post = new App.PostRecord();
			
			if (i % 4 !== 0)
				post.datePublished = Date.now();
			
			blog.retainPost(post);
		}
		
		Cover.display(new App.BlogHat());
	}
}
