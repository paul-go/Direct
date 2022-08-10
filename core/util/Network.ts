
namespace App
{
	/** */
	export interface NetworkRequestParams
	{
		/**
		 * A string to set request's method.
		 */
		method?: HttpMethod;
		
		/**
		 * 
		 */
		body?: BodyInit | null;
		
		/**
		 * A Headers object, an object literal, or an array of two-item arrays to 
		 * set request's headers.
		 */
		headers?: string[][];
		
		/**
		 * The number of times to retry the request, in the case when network access
		 * is determined to be unavailable.
		 */
		retryCount?: number;
		
		/** */
		timeout?: number;
	}
	
	/** */
	export type HttpMethod = "GET" | "POST" | "PUT";
	
	/**
	 * 
	 */
	export class Network
	{
		/**
		 * Wraps the built-in fetch() function, providing a better way
		 * to handle failure (such as network failures).
		 */
		static request(url: string, params: NetworkRequestParams = {})
		{
			return new Promise<NetworkResponse | FailResponse>(resolve =>
			{
				// A false navigator.onLine value indicates that the internet connection is 
				// definitely not available in WebKit browsers, but a true value indicates
				// uncertainty, so it cannot be used.
				
				let retryCount = 
					params.method !== "POST" &&
					params.method !== "PUT" ?
						params.retryCount || 0 :
						0;
				
				const attempt = () =>
				{
					this.tryRequest(url, params, {
						timeout: () =>
						{
							// Timeout (not currently triggered)
							if (retryCount === 0)
								return resolve(new TimeoutResponse());
							
							retryCount--;
							attempt();
						},
						error: () =>
						{
							resolve(new NoResponse());
						},
						terminate: () => resolve(new TerminateResponse()),
						progress: (loaded, total) =>
						{
							// Progress
						},
						complete: response =>
						{
							resolve(response);
						}
					});
				};
				
				attempt();
			});
		}
		
		/** */
		private static tryRequest(
			url: string,
			params: NetworkRequestParams,
			callbacks: {
				timeout: () => void;
				error: () => void;
				terminate: () => void;
				progress: (loaded: number, total: number) => void;
				complete: (response: NetworkResponse) => void
			})
		{
			const xhr = new XMLHttpRequest();
			xhr.open(params.method ?? "GET", url);
			xhr.responseType = "arraybuffer";
			//xhr.withCredentials = true;
			
			const headers = params.headers || [];
			for (const [headerName, headerValue] of headers)
				xhr.setRequestHeader(headerName, headerValue);
			
			// The timeout detection is currently disabled, because the browser's 
			// implementation doesn't appear to work very well. If the request hasn't
			// completed before the prescribed amount of time (even if a download or
			// upload is in progress), the timeout handler triggers. In order to implement
			// this properly, it appears you would need to check for progress events not
			// being triggered after a particular amount of time.
			
			/*
			xhr.timeout = params.timeout ?? 5000;
			xhr.addEventListener("timeout", () =>
			{
				this.activeRequests.delete(xhr);
				callbacks.timeout();
			});
			*/
			
			xhr.addEventListener("error", () =>
			{
				this.activeRequests.delete(xhr);
				callbacks.error();
			});
			
			xhr.addEventListener("abort", () =>
			{
				this.activeRequests.delete(xhr);
				callbacks.terminate();
			});
			
			xhr.addEventListener("load", () =>
			{
				callbacks.complete(new NetworkResponse(xhr));
			});
			
			xhr.addEventListener("progress", ev =>
			{
				callbacks.progress(ev.loaded, ev.total);
			});
			
			xhr.upload.addEventListener("progress", ev =>
			{
				callbacks.progress(ev.loaded, ev.total);
			});
			
			xhr.send(params.body as string);
		}
		
		/**
		 * Stops all outstanding requests.
		 */
		static stop()
		{
			const xhrs = Array.from(this.activeRequests);
			this.activeRequests.clear();
			
			for (const xhr of xhrs)
				xhr.abort();
		}
		
		/**
		 * Stores a map of all outstanding requests, which are keyed by 
		 * classifier strings.
		 */
		private static readonly activeRequests = new Set<XMLHttpRequest>();
	}
	
	/**
	 * 
	 */
	export class NetworkResponse
	{
		constructor(private xhr: XMLHttpRequest) { }
		
		/** */
		getHeader(headerName: string)
		{
			return this.xhr.getResponseHeader(headerName) || "";
		}
		
		/** */
		get ok()
		{
			return this.status >= 200 && this.status < 300;
		}
		
		/** */
		get status()
		{
			return this.xhr.status;
		}
		
		/** */
		get arrayBuffer()
		{
			const res = this.xhr.response;
			if (!(res instanceof ArrayBuffer))
				return new Uint8Array();
			
			return res;
		}
		
		/** */
		get text()
		{
			return new TextDecoder().decode(this.arrayBuffer);
		}
	}
	
	/** */
	export abstract class FailResponse
	{
		constructor(readonly message: string) { }
	}
	
	/**
	 * A response that indicates that all attempts to create
	 * a connection failed. This may be because the machine is
	 * offline, or due to failure on the remote endpoint.
	 */
	export class NoResponse extends FailResponse
	{
		constructor() { super(Strings.noResponse); }
	}
	
	/**
	 * A response that indicates that all request retries failed,
	 * and the request operation timed out.
	 */
	export class TimeoutResponse extends FailResponse
	{
		constructor() { super(Strings.timeoutResponse); }
	}
	
	/**
	 * A response that indicates that the user explicitly
	 * terminated the request.
	 */
	export class TerminateResponse extends FailResponse
	{
		constructor() { super(""); }
	}
	
	/**
	 * A response that indicates that the user's machine is known to
	 * be offline. This can only be detected in some cases.
	 */
	export class OfflineResponse extends FailResponse
	{
		constructor() { super(Strings.offlineResponse); }
	}
	
	/**
	 * A response that indicates that the remote endpoint returned
	 * data that the system is unable to handle.
	 */
	export class UnexpectedResponse extends FailResponse
	{
		constructor() { super(Strings.unexpectedResponse); }
	}
	
	/** */
	const enum Strings
	{
		timeoutResponse = "The network operation timed out.",
		noResponse = "Could not establish a connection to the server.",
		offlineResponse = "Your network connection is disconnected.",
		unexpectedResponse = "The server returned unexpected data.",
	}
}
