
namespace Cover
{
	/** */
	export async function coverTar()
	{
		let blob = new Blob();
		const name1 = "1.txt";
		const name2 = "2.txt";
		
		const content1 = "text-in-file-1";
		const content2 = "text-in-file-2";
		
		const writer = new Tar.Writer();
		writer.addTextFile(name1, content1);
		writer.addTextFile(name2, content2);
		blob = await writer.createBlob();
		
		const tarFile = new File([blob], name1);
		const reader = new Tar.Reader();
		await reader.readFile(tarFile);
		const extracted1 = reader.getTextFile(name1);
		const extracted2 = reader.getTextFile(name2);
			
		return [
			() => extracted1 === content1,
			() => extracted2 === content2,
		];
	}
}
