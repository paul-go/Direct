
namespace Cover
{
	const baseHref = "http://x.com/sub/";
	
	/** */
	export async function coverForeignDocumentSanitizeCss()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<style>@media screen { .b { background-image: url(image.png); } }</style>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
	
	/** */
	export async function coverForeignDocumentSanitizeCssQuotes()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<style>@media screen { .b { background-image: url("image.png"); } }</style>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
	
	/** */
	export async function coverForeignDocumentSanitizeMultipleBackgroundImages()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<style>.b { background-image: url(1.png), url(2.png); }</style>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
	
	/** */
	export async function coverForeignDocumentSanitizeHtml()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<div><img src="image.png" onload="alert()"></div>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
	
	/** */
	export async function coverForeignDocumentSanitizeSrcSet()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<img srcset="1.png 1x, 2.png 2w"></div>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
	
	/** */
	export async function coverForeignDocumentSanitizeStyleAttribute()
	{
		const doc = new Player.ForeignDocumentSanitizer(
			`<!doctype html>` +
			`<div style='background-image: url("image.png")'></div>`,
			baseHref).read();
		
		console.log(
			doc.head.outerHTML + "\n" +
			doc.body.outerHTML);
	}
}
