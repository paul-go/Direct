
//
// Code has been adapted from https://github.com/ankitrohatgi/tarballjs/
//

namespace Tar
{
	/**
	 * 
	 */
	export class Reader
	{
		private fileInfo: any[] = [];
		private buffer: ArrayBuffer = null!;
		
		/** */
		readFile(file: File)
		{
			return new Promise<object>(resolve =>
			{
				let reader = new FileReader();
				reader.onload = ev =>
				{
					const buffer = ev.target?.result;
					if (!(buffer instanceof ArrayBuffer))
						return resolve({});
					
					resolve(this.readArrayBuffer(buffer));
				};
				reader.readAsArrayBuffer(file);
			});
		}
		
		/** */
		readArrayBuffer(arrayBuffer: ArrayBuffer)
		{
			this.buffer = arrayBuffer;
			this.fileInfo = [];
			this.readFileInfo();
			return this.fileInfo;
		}
		
		/** */
		private readFileInfo()
		{
			this.fileInfo = [];
			
			let offset = 0;
			while (offset < this.buffer.byteLength - 512)
			{
				const fileName = this.readFileName(offset); // file name
				if (fileName.length === 0)
					break;
				
				const fileType = this.readFileType(offset);
				const fileSize = this.readFileSize(offset);
				
				this.fileInfo.push({
					name: fileName,
					type: fileType,
					size: fileSize,
					header_offset: offset
				});

				offset += (512 + 512 * Math.trunc(fileSize / 512));
				
				if (fileSize % 512)
					offset += 512;
			}
		}
		
		/** */
		getFileInfo()
		{
			return this.fileInfo;
		}
		
		/** */
		private readString(str_offset: number, size: number)
		{
			const strView = new Uint8Array(this.buffer, str_offset, size);
			const i = strView.indexOf(0);
			const td = new TextDecoder();
			return td.decode(strView.slice(0, i));
		}
		
		/** */
		private readFileName(header_offset: number)
		{
			return this.readString(header_offset, 100);
		}
		
		/** */
		private readFileType(header_offset: number)
		{
			// offset: 156
			const typeView = new Uint8Array(this.buffer, header_offset + 156, 1);
			const typeStr = String.fromCharCode(typeView[0]);
			
			if (typeStr === "0")
				return "file";
			
			if (typeStr === "5")
				return "directory";
			
			return typeStr;
		}
		
		/** */
		private readFileSize(header_offset: number)
		{
			// offset: 124
			const szView = new Uint8Array(this.buffer, header_offset + 124, 12);
			
			let szStr = "";
			for (let i = 0; i < 11; i++)
				szStr += String.fromCharCode(szView[i]);
			
			return parseInt(szStr, 8);
		}
		
		/** */
		private readFileBlob(file_offset: number, size: number, type: string)
		{
			const view = new Uint8Array(this.buffer, file_offset, size);
			const blob = new Blob([view], { type });
			return blob;
		}
		
		/** */
		private readFileBinary(file_offset: number, size: number)
		{
			const view = new Uint8Array(this.buffer, file_offset, size);
			return view;
		}
		
		/** */
		private readTextFile(file_offset: number, size: number)
		{
			const view = new Uint8Array(this.buffer, file_offset, size);
			const td = new TextDecoder();
			return td.decode(view);
		}
		
		/** */
		getTextFile(file_name: string)
		{
			let info = this.fileInfo.find(info => info.name === file_name);
			if (info)
				return this.readTextFile(info.header_offset + 512, info.size); 
		}
		
		/** */
		getFileBlob(file_name: string, type: string)
		{
			let info = this.fileInfo.find(info => info.name === file_name);
			if (info)
				return this.readFileBlob(info.header_offset + 512, info.size, type);
		}
		
		/** */
		getFileBinary(file_name: string)
		{
			let info = this.fileInfo.find(info => info.name === file_name);
			if (info)
				return this.readFileBinary(info.header_offset + 512, info.size); 
		}
	}
	
	/**
	 * 
	 */
	export class Writer
	{
		private fileData: any[] = [];
		private buffer: ArrayBuffer = new Uint8Array();
		
		/** */
		addTextFile(name: string, text: string, opts: IOptions = {})
		{
			const te = new TextEncoder();
			const array = te.encode(text);
			
			this.fileData.push({
				name,
				array,
				type: "file",
				size: array.length,
				dataType: "array",
				opts
			});
		}
		
		/** */
		addArrayBufferFile(name: string, arrayBuffer: ArrayBuffer, opts: IOptions = {})
		{
			const array = new Uint8Array(arrayBuffer);
			
			this.fileData.push({
				name,
				array,
				type: "file",
				size: array.length,
				dataType: "array",
				opts
			});
		}
		
		/** */
		addFile(name: string, file: File, opts: IOptions = {})
		{
			this.fileData.push({
				name,
				file,
				size: file.size,
				type: "file",
				dataType: "file",
				opts
			});
		}
		
		/** */
		addFolder(name: string, opts: IOptions = {})
		{
			this.fileData.push({
				name,
				type: "directory",
				size: 0,
				dataType: "none",
				opts
			});
		}
		
		/** */
		private createBuffer()
		{
			let tarDataSize = 0;
			
			for (let i = 0; i < this.fileData.length; i++)
			{						
				let size = this.fileData[i].size;
				tarDataSize += 512 + 512 * Math.trunc(size / 512);
				
				if (size % 512)
					tarDataSize += 512;
			}
			
			let bufSize = 10240 * Math.trunc(tarDataSize / 10240);
			if (tarDataSize % 10240)
				bufSize += 10240;
			
			this.buffer = new ArrayBuffer(bufSize); 
		}
		
		/** */
		async triggerDownload(filename: string)
		{
			let blob = await this.createBlob();
			let element = document.createElement("a");
			element.href = URL.createObjectURL(blob);
			element.download = filename;
			element.style.display = "none";
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}
		
		/** */
		async createBlob(onUpdate?: (value: number) => void)
		{
			const bytes = await this.createByteArray(onUpdate);
			return new Blob([bytes], { type:"application/x-tar" });
		}
		
		/** */
		createByteArray(onUpdate?: (value: number) => void)
		{
			return new Promise<Uint8Array>(resolve =>
			{
				this.createBuffer();
				let offset = 0;
				let filesAdded = 0;
				
				const onFileDataAdded = () =>
				{
					filesAdded++;
					
					if (onUpdate)
						onUpdate(filesAdded / this.fileData.length * 100);
					
					if (filesAdded === this.fileData.length)
						resolve(new Uint8Array(this.buffer));
				};
				
				for (let fileIdx = 0; fileIdx < this.fileData.length; fileIdx++)
				{
					const fileData = this.fileData[fileIdx];
					
					// write header
					this.writeFileName(fileData.name, offset);
					this.writeFileType(fileData.type, offset);
					this.writeFileSize(fileData.size, offset);
					this.fillHeader(offset, fileData.opts, fileData.type);
					this.writeChecksum(offset);
					
					// write file data
					let destArray = new Uint8Array(this.buffer, offset + 512, fileData.size);
					
					if (fileData.dataType === "array")
					{
						for (let byteIdx = 0; byteIdx < fileData.size; byteIdx++)
							destArray[byteIdx] = fileData.array[byteIdx];
						
						onFileDataAdded();
					}
					else if (fileData.dataType === "file")
					{
						const reader = new FileReader();
						
						reader.onload = (outArray =>
						{
							return ev =>
							{
								const buffer = ev.target?.result;
								if (!(buffer instanceof ArrayBuffer))
									return;
								
								const bytes = new Uint8Array(buffer);
								
								for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++)
									outArray[byteIdx] = bytes[byteIdx];
								
								onFileDataAdded();
							};
						})(destArray);
						
						reader.readAsArrayBuffer(fileData.file);
					}
					else if (fileData.type === "directory")
					{
						onFileDataAdded();
					}
					
					offset += (512 + 512 * Math.trunc(fileData.size / 512));
					
					if (fileData.size % 512)
						offset += 512;
				}
			});
		}
		
		/** */
		private writeString(str: string, offset: number, size: number)
		{
			const strView = new Uint8Array(this.buffer, offset, size);
			const te = new TextEncoder();
			
			if (te.encodeInto)
			{
				// Let the browser write directly into the buffer
				const written = te.encodeInto(str, strView).written || 0;
				
				for (let i = written; i < size; i++)
					strView[i] = 0;
			}
			else
			{
				// Browser can't write directly into the buffer, do it manually
				const arr = te.encode(str);
				for (let i = 0; i < size; i++)
					strView[i] = i < arr.length ? arr[i] : 0;
			}
		}
		
		/** */
		private writeFileName(name: string, header_offset: number)
		{
			// offset: 0
			this.writeString(name, header_offset, 100);
		}
		
		/** */
		private writeFileType(typeStr: string, header_offset: number)
		{
			// offset: 156
			let typeChar = "0";
			
			if (typeStr === "file")
				typeChar = "0";
			
			else if (typeStr === "directory")
				typeChar = "5";
			
			let typeView = new Uint8Array(this.buffer, header_offset + 156, 1);
			typeView[0] = typeChar.charCodeAt(0); 
		}
		
		/** */
		private writeFileSize(size: number, header_offset: number)
		{
			// offset: 124
			let sizeString = size.toString(8);
			sizeString = this.leftPad(sizeString, 11);
			this.writeString(sizeString, header_offset + 124, 12);
		}
		
		/** */
		private leftPad(number: string, targetLength: number)
		{
			let output = (number || "0") + "";
			
			while (output.length < targetLength)
				output = "0" + output;
			
			return output;
		}
		
		/** */
		private writeFileMode(mode: string, header_offset: number)
		{
			// offset: 100
			this.writeString(this.leftPad(mode, 7), header_offset + 100, 8);
		}
		
		/** */
		private writeFileUid(uid: string, header_offset: number)
		{
			// offset: 108
			this.writeString(this.leftPad(uid, 7), header_offset + 108, 8);
		}
		
		/** */
		private writeFileGid(gid: string, header_offset: number)
		{
			// offset: 116
			this.writeString(this.leftPad(gid, 7), header_offset + 116, 8);
		}
		
		/** */
		private writeFileMtime(mtime: string, header_offset: number)
		{
			// offset: 136
			this.writeString(this.leftPad(mtime, 11), header_offset + 136, 12);
		}
		
		/** */
		private writeFileUser(user: string, header_offset: number)
		{
			// offset: 265
			this.writeString(user, header_offset + 265, 32);
		}
		
		/** */
		private writeFileGroup(group: string, header_offset: number)
		{
			// offset: 297
			this.writeString(group, header_offset + 297, 32);
		}
		
		/** */
		private writeChecksum(header_offset: number)
		{
			// offset: 148
			this.writeString("		", header_offset + 148, 8); // first fill with spaces

			// add up header bytes
			const header = new Uint8Array(this.buffer, header_offset, 512);
			
			let chksum = 0;
			for (let i = 0; i < 512; i++)
				chksum += header[i];
			
			this.writeString(chksum.toString(8), header_offset + 148, 8);
		}
		
		/** */
		private fillHeader(header_offset: number, opts: IOptions, fileType: string)
		{
			const uid = this.getOpt(opts, "uid", 1000);
			const gid = this.getOpt(opts, "gid", 1000);
			const mode = this.getOpt(opts, "mode", fileType === "file" ? "664" : "775");
			const mtime = this.getOpt(opts, "mtime", Date.now());
			const user = this.getOpt(opts, "user", "tar");
			const group = this.getOpt(opts, "group", "tar");
			
			this.writeFileMode(mode, header_offset);
			this.writeFileUid(uid.toString(8), header_offset);
			this.writeFileGid(gid.toString(8), header_offset);
			this.writeFileMtime(Math.trunc(mtime / 1000).toString(8), header_offset);
			
			this.writeString("ustar", header_offset+257,6); // magic string
			this.writeString("00", header_offset+263,2); // magic version
			
			this.writeFileUser(user, header_offset);
			this.writeFileGroup(group, header_offset);
		}
		
		/** */
		private getOpt<T extends string | number>(opts: IOptions, key: keyof IOptions, defaultVal: T): T
		{
			opts ||= {};
			return (opts[key] ? opts[key] : defaultVal) as T;
		}
	}
	
	/** */
	export interface IOptions
	{
		readonly uid?: number;
		readonly gid?: string;
		readonly mode?: string;
		readonly mtime?: number;
		readonly user?: string;
		readonly group?: string;
	}
	
	if (typeof module === "object")
		Object.assign(module.exports, { Tar });
}
