
namespace App
{
	/** */
	export class Emitter
	{
		/** */
		constructor(
			minify: boolean = false,
			private readonly formatAsXml = false)
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
		open(tag: string, attributes: Literal<string, string | number> = {})
		{
			this.line(this.tagStart(tag, attributes) + ">");
		}
		
		/** */
		close(tag: string)
		{
			this.line("</" + tag + ">");
		}
		
		/** */
		tag(
			tagName: string,
			attributes: Literal<string, string | number> = {},
			innerText = "")
		{
			let text = this.tagStart(tagName, attributes);
			
			text += this.hasCloseTag(tagName) ?
				">" + innerText + "</" + tagName + ">" :
				this.formatAsXml ? "/>" : ">";
			
			this.line(text);
		}
		
		/** */
		private tagStart(tagName: string, attributes: Literal<string, string | number>)
		{
			let text = "<" + tagName;
			
			for (const [key, value] of Object.entries(attributes))
			{
				if (value === "")
					text += " " + key;
				
				else if (!value)
					continue;
				
				else if (typeof value === "string" && value.includes(`"`))
					text += ` ${key}='${value}'`;
				
				else
					text += ` ${key}="${value}"`;
			}
			
			return text;
		}
		
		/** */
		private hasCloseTag(tag: string)
		{
			return !["meta", "link", "br", "img", ].includes(tag);
		}
		
		/** */
		toString()
		{
			return this.strings.join("");
		}
	}
}
