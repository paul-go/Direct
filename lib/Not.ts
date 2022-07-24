
/**
 * Utility class for performing basic guarding.
 */
namespace Not
{
	/**
	 * @returns The argument as specified, but throws an
	 * exception in the case when it's null or undefined.
	 */
	export function nullable<T>(param: T)
	{
		if (param === null || param === undefined)
		{
			debugger;
			throw new ReferenceError();
		}
		
		return param as NonNullable<T>;
	}
	
	/**
	 * @returns The argument as specified, but throws an
	 * exception in the case when the value provided equates
	 * to a JavaScript-falsey value.
	 */
	export function falsey<T>(value: T): NonNullable<T>
	{
		if (!value)
		{
			debugger;
			throw new TypeError();
		}
		
		return value as any;
	}
	
	/**
	 * Used to mark out areas of the code that are not implemented.
	 */
	export function implemented()
	{
		debugger;
	}
	
	/**
	 * 
	 */
	export function reachable()
	{
		debugger;
		throw new TypeError();
	}
}
