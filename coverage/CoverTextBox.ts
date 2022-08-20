
namespace Cover
{
	/** */
	export async function coverTextBox()
	{
		const textBox = new App.TextBox();
		
		Hot.get(textBox.root)({
			border: "1px solid red",
		});
		
		textBox.html = "Line1<br>Line2A <b>Line2B</b> Line2C<br>Line3";
		
		document.body.append(textBox.root);
		await App.UI.wait();
		
		setTimeout(() =>
		{
			textBox.setCurrentBlockElement("h2");
		},
		3000);
		
	}
}
