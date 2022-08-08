
namespace App
{
	/**
	 * Returns an HTML <div> element that is content editable with plain text.
	 * At the moment, this only works with webkit-based browsers. Firefox isn't
	 * supported. However, this can be changed in the future by using a normal
	 * contentEditable div, and cutting off the input events that result in HTML
	 * formatting.
	 */
	export function createExpandingTextArea(...params: Htx.Param[])
	{
		return Htx.div(
			e =>
			{
				try
				{
					e.contentEditable = "plaintext-only";
				}
				catch (e) { }
				
				// contentEditable="plaintext-only" isn't supported,
				// switch to another implementation.
				if (e.contentEditable !== "plaintext-only")
				{
					console.error("This browser doesn't support contentEditable=plaintextonly.");
					e.contentEditable = "true";
				}
			},
			...params
		);
	}
}
