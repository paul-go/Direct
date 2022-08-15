
namespace App
{
	/** */
	export class BlogView
	{
		/** */
		constructor()
		{
			this.root = Htx.div(
				CssClass.blogView,
				UI.appMaxWidth(),
				this.headerElement = this.renderHeader(),
				this.postList = Htx.div(
					"post-list",
					...UI.spaceFor(() => this.renderHomePostButton()),
					this.addPostButton = this.renderAddPostButton(),
					When.connected(() => this.populatePosts())
				)
			);
		}
		
		readonly root;
		private readonly headerElement;
		private readonly addPostButton;
		private readonly postList;
		
		/** */
		private renderHeader()
		{
			return Htx.div(
				UI.clickable,
				UI.anchorTopRight(20),
				{
					position: "fixed",
					zIndex: "1",
					padding: "20px",
					borderRadius: "100%",
					backgroundColor: UI.gray(64, 0.5),
					backdropFilter: "blur(15px)",
					transitionDuration,
					transitionProperty: "transform",
				},
				Icon.settings(
					{
						width: "30px",
						height: "30px",
					}
				),
				Htx.on(UI.clickEvt, () =>
				{
					AppContainer.of(this).root.append(new SettingsView().root);
				})
			);
		}
		
		/** */
		private renderHomePostButton()
		{
			const homePost = AppContainer.of(this).homePost;
			
			return this.renderTile([
				{
					backgroundImage: "linear-gradient(45deg, #222, black)",
				},
				homePost.datePublished > 0 ? null : Htx.div(
					UI.anchorTop(15),
					{
						width: "max-content",
						margin: "auto",
						borderRadius: UI.borderRadius.max,
						color: "white",
						fontSize: UI.vw(2),
						fontWeight: "700",
						backgroundColor: UI.themeColor,
						padding: UI.vw(0.5) + " " + UI.vw(2),
					},
					new Text("Draft"),
				),
				new Text("Home"),
			], homePost);
		}
		
		/** */
		private renderAddPostButton()
		{
			return this.renderTile([
				{
					backgroundColor: UI.themeColor,
				},
				Htx.div(
					UI.presentational,
					UI.anchorCenter("max-content"),
					Icon.plus(
						{
							margin: "0 auto 2.5vw",
							width: UI.vw(3.3),
							height: UI.vw(3.3),
						},
					),
					Htx.div(
						...UI.text("Add Post", UI.vw(2.5), 600),
					),
				),
			]);
		}
		
		/** */
		private async populatePosts()
		{
			const app = AppContainer.of(this);
			const db = app.database;
			
			for await (const post of db.each(PostRecord, "peek"))
			{
				if (post === app.homePost)
					continue;
				
				const tile = this.renderPostTile(post);
				this.postList.append(tile);
			}
		}
		
		/** */
		private renderPostTile(post: PostRecord)
		{
			const date = new Date(post.dateCreated);
			
			const params: Htx.Param[] = [
				{
					backgroundImage: "linear-gradient(45deg, #222, black)",
				},
				post.datePublished > 0 ? null : Htx.div(
					UI.anchorTop(15),
					{
						width: "max-content",
						margin: "auto",
						borderRadius: UI.borderRadius.max,
						color: "white",
						fontSize: UI.vw(2),
						fontWeight: "700",
						backgroundColor: UI.themeColor,
						padding: UI.vw(0.5) + " " + UI.vw(1.5),
					},
					new Text("Draft"),
				),
				new Text(date.toDateString()),
				Htx.br(),
				new Text(date.toLocaleTimeString()),
			];
			
			return this.renderTile(params, post);
		}
		
		/** */
		private renderTile(
			previewDisplayParams: Htx.Param[],
			post?: PostRecord)
		{
			let previewTransformable: HTMLElement;
			let previewDisplay: HTMLElement;
			
			return Htx.div(
				"post-preview",
				UI.clickable,
				{
					display: "inline-block",
					verticalAlign: "top",
					width: UI.vw(33.333),
					height: UI.vw(33.333),
				},
				previewTransformable = Htx.div(
					"preview-transformable",
					UI.anchor(),
					{
						transform: "scale(1)",
						transitionDuration,
						transitionProperty: "transform, height",
						overflow: "hidden",
					},
					previewDisplay = Htx.div(
						"preview-display",
						UI.anchorTop(),
						{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
							lineHeight: "1.66",
							fontWeight: "700",
							fontSize: UI.vw(2.5),
							aspectRatio: "1 / 1",
							opacity: "1",
							transitionProperty: "opacity",
							transitionDuration,
						},
						...previewDisplayParams
					),
					Htx.on(UI.clickEvt, () =>
					{
						this.animateTile(previewTransformable, previewDisplay, post);
					})
				),
			)
		}
		
		/** */
		private animateTile(
			transformable: HTMLElement,
			previewDisplay: HTMLElement,
			post?: PostRecord)
		{
			const postView = new PostView(post);
			const parent = transformable.parentElement!;
			parent.style.zIndex = "2";
			
			const index = Query.indexOf(parent);
			const column = index % 3;
			const bounds = transformable.getBoundingClientRect();
			const transformOriginY = "0%";
			const finalOffsetFromTop = bounds.top;
			
			const transformOriginX = 
				column === 0 ? "0" :
				column === 1 ? "50%" :
				column === 2 ? "100%" : "";
			
			const scrollY = window.scrollY;
			
			UI.lockBody(async () =>
			{
				this.headerElement.style.transform = "translateY(-150%)";
				
				postView.root.classList.add(CssClass.postViewTransition);
				transformable.style.height = (window.innerWidth / 3) + "px";
				transformable.append(postView.root);
				
				await new Promise<void>(r => setTimeout(r));
				
				transformable.style.zIndex = "1";
				transformable.style.transformOrigin = transformOriginX + " " + transformOriginY;
				transformable.style.transform = `scale(3) translateY(${-(finalOffsetFromTop / 3)}px)`;
				transformable.style.height = (window.innerHeight / 3) + "px";
				previewDisplay.style.opacity = "0";
				
				await new Promise<void>(r => transformable.addEventListener("transitionend", () => r()));
				
				AppContainer.of(this).root.append(postView.root);
				postView.root.classList.remove(CssClass.postViewTransition);
				this.postList.style.display = "none";
			});
			
			let doingKeep = false;
			
			postView.setKeepCallback(post =>
			{
				doingKeep = true;
				this.addPostButton.replaceWith(
					this.renderAddPostButton(),
					this.renderPostTile(post));
			});
			
			postView.setBackCallback(() =>
			{
				UI.lockBody(async () =>
				{
					this.headerElement.style.removeProperty("transform");
					this.postList.style.display = "block";
					
					if (doingKeep)
					{
						const s = postView.root.style;
						s.transitionDuration = "0";
						await UI.wait();
						s.opacity = "1";
						s.transformOrigin = "100% 0";
						await UI.wait();
						s.transitionDuration = transitionDuration;
						await UI.wait();
						s.transform = "scale(0.3333)";
						s.opacity = "0";
						await UI.waitTransitionEnd(postView.root);
						postView.root.remove();
					}
					else
					{
						transformable.style.transitionDuration = "0";
						transformable.style.height = (window.innerHeight / 3) + "px";
						
						window.scroll(0, scrollY);
						
						transformable.append(postView.root);
						postView.root.classList.add(CssClass.postViewTransition);
						transformable.style.transitionDuration = transitionDuration;
						
						await UI.wait();
						
						transformable.style.height = (window.innerWidth / 3) + "px";
						transformable.style.removeProperty("transform");
						previewDisplay.style.opacity = "1";
						
						await UI.waitTransitionEnd(transformable);
						
						transformable.style.removeProperty("z-index");
						parent.style.removeProperty("z-index");
						postView.root.remove();
					}
				});
			});
		}
	}
	
	const transitionDuration = "0.5s";
}
