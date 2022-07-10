
namespace Cover
{
	/** */
	export async function coverTextBox()
	{
		const textBox = new Turf.TextBox();
		
		Htx.from(textBox.root)({
			border: "1px solid red",
		});
		
		textBox.html = "Line1<br>Line2A <b>Line2B</b> Line2C<br>Line3";
		
		document.body.append(textBox.root);
		await Turf.UI.wait();
		
		setTimeout(() =>
		{
			textBox.setCurrentBlockElement("h2");
		},
		3000);
		
	}
}
