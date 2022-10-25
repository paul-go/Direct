
namespace Cover
{
	/**
	 * NOTE: This code is temp. Refactor this when we've got a real home page.
	 * A class that creates the home page content on the Direct website.
	 */
	export class HomePage
	{
		/** */
		constructor() { }
		
		/** */
		getElement()
		{
			return Hot.section(
				"section-home",
				Hot.div(
					Hot.img({ src: "home-direct.svg" }),
					Hot.p(new Text(
						"Direct makes the web awesome again.. " +
						"you know.. like before Zuck screwed everything up."
					)),
					Hot.a(
						{ href: "" },
						Hot.span(new Text("Install macOS App"))
					),
					Hot.p(
						new Text("Or just scroll down...")
					),
				)
			);
		}
	}
}
