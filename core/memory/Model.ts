
namespace App.Model
{
	/** */
	export function array<T extends object>(): T[]
	{
		return isInspecting ? arrayMarker as any : [];
	}
	
	/** */
	export function reference<T extends object>(): T | null
	{
		return isInspecting ? referenceMarker as any: null;
	}
	
	/** */
	export async function retain(object: object, keySegment = "")
	{
		const segment = keySegment || Key.segmentOf(object);
		const entries: [Key, object][] = [];
		
		for (const sub of Model.recurse(object))
			if (Key.set(sub, segment))
				upgrade(sub);
		
		const relocateBlob = (blob: Blob) =>
		{
			const [key, ref] = BlobReference.create(segment);
			entries.push([key, blob]);
			return ref;
		};
		
		for (const sub of Model.recurse(object))
		{
			const key = Key.of(sub);
			const serializedObject: any = {};
			entries.push([key, serializedObject]);
			
			for (const [memberName, memberType] of Model.inspect(sub))
			{
				const memberValue = (sub as any)[memberName];
				let children: object[] = [];
				let serializedValue: any = null;
				
				if (memberType === "model-array")
				{
					children = memberValue;
					serializedValue = children.map(o => Key.of(o));
				}
				else if (memberType === "model-reference")
				{
					if (memberValue)
					{
						children.push(memberValue);
						serializedValue = Key.of(memberValue);
					}
				}
				else if (memberType === "blob")
				{
					serializedValue = memberValue instanceof Blob ?
						relocateBlob(memberValue) :
						null;
				}
				else
				{
					// (Cloning necessary if the value is behind a Proxy)
					serializedValue = JSON.parse(JSON.stringify(memberValue));
				}
				
				serializedObject[memberName] = serializedValue;
				
				for (const child of children)
					setOwner(sub, child);
			}
		}
		
		await Store.current().set(entries);
	}
	
	/** */
	export function inspect<T extends object>(object: T): MemberLayout
	{
		const ctor = 
			typeof object === "function" ? object :
			typeof object === "object" ? (object as any).constructor : null;
		
		if (!ctor || ctor === Object)
			throw new Error("Cannot inspect the provided object.");
		
		return inspectCtor(ctor);
	}
	
	/** */
	function inspectCtor<T extends object>(ctor: new() => T): MemberLayout
	{
		let layout = memberLayouts.get(ctor);
		if (!layout)
		{
			isInspecting = true;
			const inspectable = new ctor();
			isInspecting = false;
			layout = [];
			
			for (const [memberName, memberValue] of Object.entries(inspectable))
			{
				if (memberName === "id")
					continue;
				
				const mt: MemberType = 
					memberValue === arrayMarker ? "model-array" :
					memberValue === referenceMarker ? "model-reference" :
					memberValue instanceof Blob ? "blob" :
					Array.isArray(memberValue) ? "plain-array" :
					typeof memberValue as MemberType
				
				layout.push([memberName, mt]);
			}
			
			memberLayouts.set(ctor, layout);
		}
		
		return layout;
	}
	
	/** */
	export function * recurse(via: object | object[])
	{
		function * inner(root: object): IterableIterator<object>
		{
			yield root;
			
			for (const [memberName, memberType] of Model.inspect(root))
			{
				const memberValue = (root as any)[memberName];
				if (!memberValue)
					continue;
				
				if (memberType === "model-array")
				{
					for (const arrayItem of memberValue)
						if (arrayItem && typeof arrayItem === "object")
							yield * inner(arrayItem);
				}
				else if (memberType === "model-reference")
				{
					yield * inner(memberValue);
				}
			}
		}
		
		const objects = Array.isArray(via) ? via : [via];
		for (const object of objects)
			yield * inner(object);
	}
	
	/**
	 * Enumerates through the model children of the specified object.
	 */
	function * childrenOf(object: object)
	{
		for (const [memberName, memberType] of Model.inspect(object))
		{
			const memberValue = (object as any)[memberName];
			if (!memberValue)
				continue;
			
			if (memberType === "model-reference")
				yield memberValue as object;
			
			else if (memberType === "model-array")
				for (const arrayItem of memberValue)
					if (arrayItem && typeof arrayItem === "object")
						yield arrayItem as object;
		}
	}
	
	/** */
	export async function get<T extends object = object>(key: Key, shallow?: "shallow"): Promise<T> 
	{
		if (!key)
			throw "Key required.";
		
		const existing = heap.get(key);
		if (existing)
			return existing as T;
		
		const object = await Store.current().get(key);
		const model = object ? modelize(key, object, shallow) : null;
		return model as T;
	}
	
	/** */
	async function pick(keys: Key[])
	{
		if (keys.length === 0)
			return [];
		
		keys = keys.filter((v, i, a) => a.indexOf(v) === i);
		
		const entries: [Key, object | null][] = [];
		const keysOfNeeded: Key[] = [];
		
		for (let i = -1; ++i < keys.length;)
		{
			const key = keys[i];
			const existing = heap.get(key);
			if (existing)
				entries.push([key, existing]);
			else
				keysOfNeeded.push(key);
		}
		 
		const modelObjects: object[] = [];
		const plainObjects = await Store.current().get(keysOfNeeded);
		
		for (let i = -1; ++i < keysOfNeeded.length;)
		{
			const key = keysOfNeeded[i];
			const plainObject = plainObjects[i];
			const modelized = await modelize(key, plainObject);
			modelObjects.push(modelized);
		}
		
		return modelObjects;
	}
	
	/** */
	async function modelize<T extends object>(
		key: Key,
		plainObject: object,
		shallow?: "shallow"): Promise<T>
	{
		const instance = Key.instantiate(key);
		const instany = instance as any;
		const ctor = Key.ctorOf(Key.stableOf(key));
		const layout = inspectCtor(ctor);
		
		for (const [memberName, memberType] of layout)
		{
			if (!(memberName in plainObject))
				continue;
			
			const rawValue = (plainObject as any)[memberName];
			
			if (!shallow && memberType === "model-array")
			{
				const ids = rawValue as Key[];
				if (Array.isArray(ids))
				{
					const children = await pick(ids);
					instany[memberName] = children;
					
					for (const child of children)
						setOwner(instance, child);
				}
			}
			else if (!shallow && memberType === "model-reference")
			{
				const child = rawValue ?
					await get(rawValue) :
					null;
				
				instany[memberName] = child;
				
				if (child)
					setOwner(instance, child);
			}
			else if (!shallow && memberType === "blob")
			{
				const key = BlobReference.parse(rawValue);
				const blob = await Store.current().get(key);
				instany[memberName] = blob instanceof Blob ? blob : null;
			}
			else instany[memberName] = rawValue;
		}
		
		Key.overwrite(instance, key);
		upgrade(instance);
		
		if (!shallow)
			heap.set(key, instance);
		
		return instance as T;
	}
	
	/**
	 * Converts the members of the object to properties
	 * that access the underlying Keyva. 
	 */
	function upgrade<T extends Object>(object: T)
	{
		for (const [name, memberType] of Model.inspect(object))
		{
			if (memberType === "model-array")
				defineArrayProperty(object, name, "for-model");
			
			else if (memberType === "model-reference")
				defineModelProperty(object, name);
			
			else if (memberType === "plain-array")
				defineArrayProperty(object, name);
			
			else
				definePrimitiveProperty(object, name);
		}
	}
	
	/** */
	function definePrimitiveProperty(object: object, memberName: string)
	{
		let backingValue = (object as any)[memberName] as Primitive;
		
		Object.defineProperty(object, memberName, {
			get: () => backingValue,
			set: (value: Primitive) =>
			{
				if (value === backingValue)
					return value;
				
				queueSave(object);
				return backingValue = value;
			}
		});
	}
	
	/** */
	function defineModelProperty(object: object, memberName: string)
	{
		let backingValue: object | null = (object as any)[memberName];
		
		Object.defineProperty(object, memberName, {
			get: () => backingValue,
			set: (assignee: object | null) =>
			{
				if (assignee === backingValue)
					return;
				
				if (backingValue)
					queueDelete(backingValue);
				
				if (assignee)
					queueSave(assignee, object);
				
				queueSave(object);
				return backingValue = assignee;
			}
		});
	}
	
	/** */
	function defineArrayProperty(object: object, memberName: string, forModel?: "for-model")
	{
		const target = (object as any)[memberName] as any as object[];
		let observableArray = toObservableArray(object, target, forModel);
		
		Object.defineProperty(object, memberName, {
			get: () => observableArray,
			set: (newObjects: object[]) =>
			{
				if (forModel)
				{
					for (const existingObject of observableArray)
						queueDelete(existingObject);
					
					for (const newObject of newObjects)
						queueSave(newObject, object);
				}
				
				queueSave(object);
				return observableArray = toObservableArray(object, newObjects);
			}
		});
	}
	
	/** */
	function toObservableArray(owner: object, array: object[], forModel?: "for-model")
	{
		const isModel = (o: any): o is object => !!forModel && typeof o === "object";
		
		return new Proxy(array, {
			get(target, name: string)
			{
				switch (name)
				{
					case array.copyWithin.name: return (idx: number, start: number, end?: number) =>
					{
						array.copyWithin(idx, start, end);
						queueSave(owner);
					};
					case array.pop.name: return () =>
					{
						if (array.length === 0)
							return undefined;
						
						const result = array.pop();
						if (isModel(result))
							queueDelete(result);
						
						queueSave(owner);
						return array.pop();
					};
					case array.push.name: return (...args: any[]) =>
					{
						if (args.length === 0)
							return array.length;
						
						if (forModel)
							for (const arg of args)
								queueSave(arg, owner);
						
						queueSave(owner);
						return array.push(...args);
					};
					case array.reverse.name: return () =>
					{
						if (array.length > 1)
							queueSave(owner);
						
						return array.reverse();
					};
					case array.shift.name: return () =>
					{
						if (array.length === 0)
							return undefined;
						
						const result = array.shift();
						if (isModel(result))
							queueDelete(result);
						
						queueSave(owner);
						return result;
					};
					case array.unshift.name: return (...args: any[]) =>
					{
						if (args.length === 0 || array.length === 0)
							return array.length;
						
						if (forModel)
							for (const arg of args)
								queueSave(arg, owner);
						
						queueSave(owner);
						return array.unshift(...args);
					};
					case array.sort.name: return (compareFn: any) =>
					{
						if (array.length < 2)
							return array;
						
						queueSave(owner);
						return array.sort(compareFn);
					};
					case array.splice.name: return (
						start: number,
						deleteCount?: number,
						...insertables: any[]) =>
					{
						deleteCount ||= 0;
						const deleted = array.splice(start, deleteCount, ...insertables);
						
						if (forModel)
						{
							for (const del of deleted)
								queueDelete(del);
							
							for (const ins of insertables)
								queueSave(ins, owner);
						}
						
						if (deleteCount > 0 || insertables.length > 0)
							queueSave(owner);
						
						return deleted;
					}
					case "length": return array.length;
					
					default: return (array as any)[name];
				}
			},
			set(target, p, value, receiver)
			{
				throw "The .length property is not writable.";
			},
		});
	}
	
	//# Saving & Garbage Management
	
	/** */
	function queueSave(object: object, container?: object)
	{
		if (container)
			setOwner(container, object);
		
		watchTrigger(object);
		dirtyObjects.add(object);
		const marked = getMarkedKeys();
		
		if (Key.of(object))
			for (const sub of Model.recurse(object))
				marked.delete(Key.of(sub), ...BlobReference.find(sub));
		
		const segment = container ? 
			Key.segmentOf(container) :
			Key.segmentOf(object);
		
		if (segment)
			tempSegmentStorage.set(object, segment);
		
		clearTimeout(saveTimeoutId);
		saveTimeoutId = setTimeout(() =>
		{
			if (dirtyObjects.size === 0)
				return;
			
			const dirtyObjectsCopy = Array.from(dirtyObjects);
			dirtyObjects.clear();
			
			for (const dirtyObject of dirtyObjectsCopy)
			{
				const seg = tempSegmentStorage.get(dirtyObject);
				tempSegmentStorage.delete(dirtyObject);
				Model.retain(dirtyObject, seg || "");
			}
		},
		1);
	}
	let saveTimeoutId: any = 0;
	const tempSegmentStorage = new WeakMap<object, string>();
	
	/** */
	function queueDelete(object: object)
	{
		const marked = getMarkedKeys();
		
		for (const sub of Model.recurse(object))
			marked.add(Key.of(sub), ...BlobReference.find(sub));
		
		deleteTimeoutId = setTimeout(() =>
		{
			const keys = Array.from(marked);
			Store.current().delete(keys);
		},
		1);
	}
	let deleteTimeoutId: any = 0;
	
	/** */
	function getMarkedKeys()
	{
		return markedKeys ||= new LocalStorageSet("deletion");
	}
	let markedKeys: LocalStorageSet | null = null;
	
	//# Tracking Modified Objects
	
	const [watchConnect, watchTrigger] = Force.create<(object: object) => void>();
	
	/**
	 * A force function that is invoked every time the properties of any
	 * model object change. Use of this force function requires care, 
	 * because making changes to models within the callback function
	 * can cause infinite reinvoking of the force function.
	 */
	export const watch = watchConnect;
	
	//# Owner Management
	
	/**
	 * Returns an array of objects that have the specified object
	 * as a direct model child, either in a model property, or as a
	 * member in a model array.
	 */
	export function ownersOf(child: object): object[];
	export function ownersOf<T extends object>(child: object, targetType: new() => T): T[];
	export function ownersOf<T extends object>(child: object, targetType?: new() => T): T[]
	{
		if (!targetType)
			return (ownerTable.get(child) || []) as T[];
		
		const descendantOwners: T[] = [];
		
		const recurse = (via: object) =>
		{
			const immediateOwners = (ownerTable.get(via) || []) as T[];
			for (const immediateOwner of immediateOwners)
			{
				if (immediateOwner instanceof targetType)
					descendantOwners.push(immediateOwner);
				else
					recurse(immediateOwner);
			}
		};
		
		recurse(child);
		return descendantOwners;
	}
	
	/**
	 * Establishes a parent-child relationship between
	 * the two objects specified.
	 */
	function setOwner(owner: object, child: object)
	{
		const storedOwners = ownerTable.get(child);
		if (storedOwners)
		{
			for (const storedOwner of storedOwners)
			{
				const actualChildren = new Set(childrenOf(storedOwner));
				if (!actualChildren.has(child))
					storedOwners.delete(storedOwner);
			}
			
			storedOwners.add(owner);
		}
		
		ownerTable.set(child, storedOwners || new Set([owner]));
	}
	
	const ownerTable = new WeakMap<object, Set<object>>();
	
	//# Helpers
	
	type Primitive = string | number | boolean | object | null;
	type MemberType = 
		"string" | 
		"number" | 
		"boolean" | 
		"blob" |
		"object" | 
		"plain-array" | 
		"model-array" | 
		"model-reference";
	
	type MemberLayout = [string, MemberType][];
	const memberLayouts = new Map<new() => object, MemberLayout>();
	const arrayMarker = Object.freeze({});
	const referenceMarker = Object.freeze({});
	const dirtyObjects = new Set<object>();
	const heap = new WeakMapIterable<Key, object>();
	let isInspecting = false;
}
