
namespace Turf
{
	/** */
	export class Emitter
	{
		/** */
		constructor(minify: boolean = false)
		{
			this.indentChar = minify ? "" : "\t";
			this.lineChar = minify ? "" : "\n";
			this.space = minify ? "" : " ";
		}
		
		private readonly indentChar: string;
		private readonly lineChar: string;
		private readonly strings: string[] = [];
		
		/** Gets the space character, or empty if the emitter is operating in minified mode. */
		readonly space: string;
		
		/** */
		line(text = "")
		{
			this.strings.push(this.getIndent());
			
			if (text !== "")
				this.strings.push(text);
			
			this.strings.push(this.lineChar);
		}
		
		/** */
		lines(...lines: string[])
		{
			for (const line of lines)
				this.line(line);
		}
		
		/** */
		indent()
		{
			this.currentIndent++;
		}
		
		/** */
		outdent()
		{
			this.currentIndent--;
		}
		
		/** */
		private getIndent()
		{
			return this.indentChar.repeat(this.currentIndent);
		}
		
		private currentIndent = 0;
		
		/** */
		tag(
			tagName: string,
			attributes: Literal<string, string | number> = {},
			innerText?: string)
		{
			let text = "<" + tagName;
			
			for (const [key, value] of Object.entries(attributes))
			{
				if (value === "")
					text += " " + key;
				
				else if (!value)
					continue;
				
				else
					text += ` ${key}="${value}"`;
			}
			
			text += ">";
			
			if (innerText !== undefined)
				text += innerText + "</" + tagName + ">";
			
			this.line(text);
		}
		
		/** */
		tagEnd(tag: string | HTMLElement)
		{
			const name = typeof tag === "string" ? tag : tag.tagName.toLowerCase();
			this.line("</" + name + ">");
		}
		
		/** */
		toString()
		{
			return this.strings.join("");
		}
	}
}
