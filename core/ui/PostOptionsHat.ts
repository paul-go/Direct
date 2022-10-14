
namespace App
{
	/** */
	export class PostOptionsHat
	{
		readonly head;
		
		/** */
		constructor(post: PostRecord, isHome: boolean)
		{
			this.head = Hot.div(
				MainMenuHat.getWindowStyle(),
				{
					padding: "30px",
				},
				
				heading1("Post Options"),
				
				!isHome && UI.heading("Slug"),
				!isHome && Hot.input(
					textBoxRule,
					{
						value: post.slug,
						placeholder: "Slug",
					}
				),
				
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
					post.slug = this.slugInput?.value || "";
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
