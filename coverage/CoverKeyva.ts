
namespace Cover
{
	/** */
	export async function coverKeyvaBasic()
	{
		await Keyva.delete();
		
		const keyva = new Keyva({
			indexes: "type",
			name: Date.now(),
		});
		
		await keyva.set(1, { type: "number", number: 0 });
		await keyva.set(2, { type: "string", string: "b" });
		await keyva.set(3, { type: "string", string: "c" });
		await keyva.set(4, { type: "string", string: "d" });
		await keyva.set(5, { type: "number", number: 1 });
		
		const range = IDBKeyRange.only("number");
		
		for await (const [value, key] of keyva.each({ index: "type", range }))
			console.log("Key: " + key + ", Value: " + JSON.stringify(value));
	}
	
	/** */
	export async function coverKeyvaSetGet()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set(1, "value");
		const value = await keyva.get(1);
		return () => value === "value";
	}
	
	/** */
	export async function coverKeyvaSetManyGetMany()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set(
			[1, "a"],
			[2, "b"],
			[3, "c"],
			[4, "d"],
		);
		
		const values = await keyva.get<string>([2, 3]);
		return [
			() => values.length === 2,
			() => values[0] === "b",
			() => values[1] === "c",
		];
	}
}
