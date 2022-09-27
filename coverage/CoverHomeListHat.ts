
namespace Cover
{
	/** */
	export async function coverHomeListHat()
	{
		const app = await App.createApp({ shell: true, clear: true });
		const post = Sample.createPost();
		await app.blog.retainPost(post);
		const homeList = new App.HomeListHat();
		Cover.display(homeList);
	}
}
