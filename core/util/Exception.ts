
namespace Turf
{
	/** @internal */
	export class Exception
	{
		/** */
		static warn(): null
		{
			console.warn("A warning was generated. Please see the stack trace.");
			debugger;
			return null;
		}
		
		/** */
		static invalidArgument()
		{
			return error("An invalid argument was detected.");
		}
		
		/** */
		static invalidState()
		{
			return error(
				"The operation cannot be completed, " +
				"given the current state of an affected object.");
		}
		
		/** */
		static unknownState(customMessage: string = "")
		{
			return error("An unknown state has been reached in the program." + 
				customMessage ? " Custom error message was:\n" + customMessage : "");
		}
		
		/** */
		static notImplemented()
		{
			return new Error("Behavior has not been implemented.");
		}
		
		/** */
		static operationNotSupported()
		{
			return new Error("This operation is not supported on this object.");
		}
	}
	
	/**
	 * Generates a proper error object from the specified message.
	 */
	function error(msg: string)
	{
		// This debugger has to be here, because VSCode's debugger
		// isn't stopping when exceptions are thrown.
		debugger;
		return new Error(msg.trim().replace(/\s\s+/g, " "));
	}
}
