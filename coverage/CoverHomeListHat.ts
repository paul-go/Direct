
namespace Cover
{
	/** */
	export async function coverHomeListHat()
	{
		const app = await App.createApp({ shell: true, clear: true });
		
		const posts = Sample.createPosts(4);
		for (const post of posts)
			await app.blog.retainPost(post);
		
		const homeList = new App.HomeListHat();
		Cover.display(homeList);
	}
}
