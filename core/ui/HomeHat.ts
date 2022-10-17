
namespace App
{
	/** */
	export class HomeHat
	{
		readonly head;
		
		/** */
		constructor(app: AppContainer)
		{
			this.head = Hot.div(
				"home-hat",
				{
					transitionProperty: "transform, filter",
					transitionDuration: "0.66s",
				},
				this.homeHatCore = Hot.div(
					"home-hat-core",
					{
						transform: "none",
						transitionProperty: "inherit",
						transitionDuration: "inherit",
						filter: "brightness(1)",
					},
					new PostHat(app.blog.homePost),
					this.addPostButton = Hot.div(
						{
							position: "sticky",
							width: 0,
							height: 0,
							top: 0,
							left: 0,
							zIndex: 1,
							transitionDuration: "0.5s",
							transitionProperty: "transform",
							transform: "none",
						},
						UI.circleButton(
							UI.anchorTopLeft(30),
							Icon.plus(),
							UI.click(() => this.addNewPost())
						)
					),
					this.homeListHat = this.createHomeListHat(),
				)
			);
			
			Hat.wear(this);
		}
		
		private readonly homeHatCore;
		private homeListHat;
		private addPostButton;
		
		/** */
		private createHomeListHat()
		{
			const hat = new HomeListHat();
			
			hat.omniview.enterReviewFn(() =>
			{
				this.addPostButton.style.transform = "translateX(-128px)";
			});
			
			hat.omniview.exitReviewFn(() =>
			{
				this.addPostButton.style.removeProperty("transform");
			});
			
			if (this.homeListHat)
				this.homeListHat.head.replaceWith(hat.head);
			
			this.homeListHat = hat;
			return hat;
		}
		
		/** */
		private async addNewPost()
		{
			this.newPostHat = Hot.get(new PostHat())({
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				transform: "translateY(100vh)",
				transitionProperty: "inherit",
				transitionDuration: "inherit",
				zIndex: 1,
			});
			
			const exitChevron = Hot.div(
				{
					position: "sticky",
					width: 0,
					height: 0,
					left: 0,
					right: 0,
					margin: "auto",
					zIndex: 3,
				},
				Hot.div(
					{
						width: "64px",
						height: "64px",
						left: "-32px",
						paddingTop: "48px",
					},
					Icon.chevron(Origin.top, {
						margin: "auto",
					}),
					UI.click(() => this.hideNewPost()),
				)
			);
			
			this.newPostHat.head.prepend(exitChevron);
			this.head.append(this.newPostHat.head);
			await UI.wait(1);
			
			Hot.get(this.homeHatCore)({
				transform: "translateY(-50vh)",
				filter: "brightness(0)",
			});
			
			Hot.get(this.newPostHat)({
				transform: "translateY(0)",
			});
			
			Hot.get(this.head)(
				UI.escape(() => this.hideNewPost())
			);
			
			await UI.waitTransitionEnd(this.homeHatCore);
			this.homeHatCore.style.display = "none";
		}
		
		/** */
		private async hideNewPost()
		{
			const newPostHat = this.newPostHat;
			if (!newPostHat)
				return;
			
			if (newPostHat.isKeepingRecord)
			{
				this.createHomeListHat();
			}
			
			this.homeHatCore.style.display = "block";
			await UI.wait();
			this.homeListHat.head.scrollIntoView({ block: "start", behavior: "auto" });
			
			Hot.get(this.homeHatCore)({
				transform: "translateY(0)",
				filter: "brightness(1)",
			});
			
			Hot.get(newPostHat)({
				transform: "translateY(100vh)",
			});
			
			await UI.waitTransitionEnd(newPostHat.head);
			this.newPostHat?.head.remove();
			this.newPostHat = null;
		}
		
		private newPostHat: PostHat | null = null;
	}
}
