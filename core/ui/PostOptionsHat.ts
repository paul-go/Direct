
namespace App
{
	/** */
	export class PostOptionsHat
	{
		readonly head;
		
		/** */
		constructor(private readonly post: PostRecord)
		{
			this.head = Hot.div(
				MainMenuHat.getWindowStyle(),
				{
					padding: "30px",
				},
				
				heading1("Post Options"),
				
				!post.isHomePost && UI.heading("Slug"),
				!post.isHomePost && (this.slugInput = this.renderSlugInput()),
				
				heading2("Title"),
				this.titleInput = Hot.input(
					textBoxRule,
					{
						value: post.title,
						placeholder: "Empty",
					}
				),
				
				heading2("Description"),
				this.descriptionInput = Hot.textarea(
					textBoxRule,
					{
						resize: "none",
						height: "6em",
					},
					{
						placeholder: "Empty",
					} as any,
					new Text(post.description)
				),
				
				false && UI.actionButton(
					"outline",
					new Text("Delete Post"),
					UI.click(() => this.hide()),
				),
				
				Hot.div(
					{ display: "flex" },
					!UI.actionButton(
						"filled",
						{
							padding: "25px 35px",
							width: "fit-content",
							marginRight: "1em",
						},
						new Text("Delete"),
						UI.click(() => this.delete()),
					),
					UI.actionButton(
						"filled",
						{
							width: "100%",
						},
						new Text("Done"),
						UI.click(() => this.hide()),
					),
				),
				
				When.disconnected(() =>
				{
					post.title = this.titleInput.value;
					post.description = this.descriptionInput.value;
				})
			);
			
			Hat.wear(this);
		}
		
		private readonly slugInput?: HTMLInputElement;
		private readonly titleInput;
		private readonly descriptionInput;
		
		/** */
		private renderSlugInput()
		{
			const storedSlug = this.post.slug;
			
			const e = Hot.input(
				textBoxRule,
				{
					value: this.post.slug,
					placeholder: "Slug",
				},
				Hot.on("input", () =>
				{
					const slug = e.value = e.value.toLocaleLowerCase();
					const valid = Util.isSlugValid(slug);
					e.style.color = !slug || valid ? "white" : "red";
					
					if (valid)
						this.post.slug = slug;
				}),
				When.disconnected(() =>
				{
					// The slug cannot be set to an empty value.
					this.post.slug = this.slugInput?.textContent || storedSlug;
				})
			);
			
			return e;
		}
		
		/** */
		private delete()
		{
			this.hide();
		}
		
		/** */
		private hide()
		{
			Hat.nearest(this, MainMenuHat)?.hide();
		}
	}
	
	/** */
	function heading1(text: string)
	{
		return Hot.h1(
			{ marginBottom: "1.75em" },
			...UI.text(text, 32, 700),
		);
	}
	
	/** */
	function heading2(text: string)
	{
		return Hot.h2(
			{ opacity: 0.66 },
			...UI.text(text, 20, 700),
		);
	}
	
	const textBoxRule = Hot.css(
		{ width: "-webkit-fill-available" },
		{ width: "100%" },
		{ width: "stretch" },
		{ width: "fill-available" },
		{
			marginBottom: "1.5em",
			padding: "20px 0",
			border: 0,
			borderBottom: "1px solid " + UI.white(0.2),
			background: "transparent",
			fontFamily: "inherit",
			fontWeight: 600,
			fontSize: "28px",
		},
	);
}
