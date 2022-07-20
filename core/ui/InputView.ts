
namespace Turf
{
	/** */
	export class InputView
	{
		/** */
		constructor(label: string, ...params: Htx.Param<Htx.InputElementAttribute>[])
		{
			this.root = Htx.div(
				"input-view",
				Htx.div(
					UI.anchorTopLeft(),
					{
						zIndex: "1",
						fontStyle: "italic",
						opacity: "0.66",
					},
					...UI.text(label, 20, 400)
				),
				this.input = Htx.input(
					{
						marginBottom: "20px",
						display: "block",
						width: "100%",
						padding: "40px 0 10px",
						border: "0",
						borderBottom: "1px solid " + UI.black(0.1),
						backgroundColor: "transparent",
						outline: "0",
						fontSize: "22px",
						fontWeight: "600",
					},
					...params
				)
			);
		}
		
		readonly root;
		readonly input;
	}
}
