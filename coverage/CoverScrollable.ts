
namespace Cover
{
	/** */
	export async function coverScrollable()
	{
		const div1 = Hot.div(
			"outer",
			Player.scrollable("y"),
			{
				width: "50vw",
				height: "40vh",
				border: "1px solid red",
			},
			Hot.div(
				"inner",
				{
					contentEditable: true,
					fontSize: "25vw",
					color: "gray",
					wordBreak: "break-all",
					background: "linear-gradient(orange, crimson)",
					width: "50%",
					height: "300%",
				},
			),
		);
		
		const div2 = Hot.div(
			"outer",
			Player.scrollable("y"),
			{
				width: "50vw",
				height: "40vh",
				border: "1px solid red",
			},
			Hot.div(
				"inner",
				{
					contentEditable: true,
					fontSize: "25vw",
					color: "gray",
					wordBreak: "break-all",
					background: "linear-gradient(orange, crimson)",
					width: "50%",
					height: "300%",
				},
			)
		);
		
		document.body.append(div1, Hot.br(), Hot.br(), div2);
	}
}
