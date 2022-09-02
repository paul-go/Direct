
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
		
		for (const [value, key] of await keyva.get(range, "type"))
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
		await keyva.set([
			[1, "a"],
			[2, "b"],
			[3, "c"],
			[4, "d"],
		]);
		
		const values = await keyva.get<string>([2, 3]);
		return [
			() => values.length === 2,
			() => values[0] === "b",
			() => values[1] === "c",
		];
	}
	
	/** */
	export async function coverKeyaGetRangeKeysValues()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set([
			[1, "a"],
			[2, "b"],
			[3, "c"],
			[4, "d"],
		]);
		
		const results = await keyva.get(IDBKeyRange.bound(2, 3));
		
		return [
			() => results.length === 2,
			() => JSON.stringify(results[0]) === JSON.stringify([2, "b"]),
			() => JSON.stringify(results[1]) === JSON.stringify([3, "c"]),
		];
	}
	
	/** */
	export async function coverKeyaGetRangeKeys()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set([
			[1, "a"],
			[2, "b"],
			[3, "c"],
			[4, "d"],
		]);
		
		const results = await keyva.get(IDBKeyRange.bound(2, 3), Keyva.keys);
		
		return [
			() => results.length === 2,
			() => results[0] === 2,
			() => results[1] === 3,
		];
	}
	
	/** */
	export async function coverKeyaGetRangeValues()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set([
			[1, "a"],
			[2, "b"],
			[3, "c"],
			[4, "d"],
		]);
		
		const results = await keyva.get(IDBKeyRange.bound(2, 3), Keyva.values);
		
		return [
			() => results.length === 2,
			() => results[0] === "b",
			() => results[1] === "c",
		];
	}
	
	/** */
	export async function coverKeyvaDelete()
	{
		await Keyva.delete();
		const keyva = new Keyva();
		await keyva.set([
			[-1, "a"],
			[String.fromCharCode(0), "b"],
			["(", "c"],
			[1, "d"],
			[2, "e"],
			[3, "f"],
			[4, "g"],
			["0", "h"],
		]);
		
		await keyva.delete();
		let hasItems = false;
		
		for (const [, k] of await keyva.get())
		{
			hasItems = true;
			console.log("Error, found: " + k);
		}
		
		return () => !hasItems;
	}
	
	/** */
	export async function coverKeyvaMultipleConnections()
	{
		await Keyva.delete();
		const keyva1 = new Keyva();
		await keyva1.set(1, "a");
		
		const keyva2 = new Keyva();
		await keyva2.set(2, "b");
		
		let count = 0;
		
		for (const [value, key] of await keyva1.get())
		{
			console.log(key + ": " + value);
			count++;
		}
		
		for (const [value, key] of await keyva2.get())
		{
			console.log(key + ": " + value);
			count++;
		}
		
		return () => count === 4;
	}
}
