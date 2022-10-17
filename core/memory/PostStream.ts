
namespace App
{
	/**
	 * A class that allows the stream of posts for a blog to
	 * be accessed efficiently.
	 */
	export class PostStream
	{
		/** */
		static async new(segment: string)
		{
			const key = [segment, "posts"].join();
			const store = Store.current();
			const tuples = await store.get<string[]>(key) || [];
			return new PostStream(key, tuples);
		}
		
		/** */
		private constructor(
			private readonly streamKey: string,
			private readonly tuples: string[])
		{ }
		
		/**
		 * Returns the number of posts in the PostStream.
		 */
		get length()
		{
			return this.tuples.length;
		}
		
		/**
		 * Returns an array of PostStreamRecordFuture objects
		 * within the given range.
		 */
		query(rangeStart: number = 0, rangeEnd = this.tuples.length)
		{
			const slice = this.tuples.slice(rangeStart, rangeEnd);
			const tupleSlice = slice.map(s => s.split(tupleSeparator) as [string, string]);
			const results: PostStreamRecordFuture[] = [];
			
			for (const [sceneKey, postKey] of tupleSlice)
			{
				results.push({
					getScene()
					{
						return Model.get<SceneRecord>(sceneKey);
					},
					getPost()
					{
						return Model.get<PostRecord>(postKey);
					},
					getPartialPost()
					{
						return Model.get<PartialPostRecord>(postKey, "shallow");
					},
				});
			}
			
			return results;
		}
		
		/**
		 * Returns whether the specified PostRecord is referenced
		 * within this PostStream.
		 */
		has(postRecord: PostRecord)
		{
			const key = Key.of(postRecord);
			
			for (let i = 0; i < this.tuples.length; i += 2)
				if (this.tuples[i + 1] === key)
					return true;
			
			return false;
		}
		
		/**
		 * Inserts a reference to the PostRecord at the beginning of the post stream.
		 */
		insert(post: PostRecord)
		{
			const sceneKey = post.scenes.length ? Key.of(post.scenes[0]) : "";
			const postKey = Not.falsey(Key.of(post));
			const tuple = [sceneKey, postKey].join(tupleSeparator);
			this.tuples.unshift(tuple);
			this.queueSave();
		}
		
		/**
		 * This method should be called when the list of scenes has
		 * changed within a PostRecord, so that the PostStream can
		 * be updated accordingly, 
		 */
		update(post: PostRecord)
		{
			const postKey = Key.of(post);
			
			for (let i = -1; ++i < this.tuples.length;)
			{
				let [sceneKey, currentPostKey] = this.tuples[i].split(tupleSeparator);
				
				if (currentPostKey === postKey)
				{
					sceneKey = "";
					if (post.scenes.length > 0)
						sceneKey = Key.of(post.scenes[0]);
					
					this.tuples[i] = [sceneKey, postKey].join(tupleSeparator);
					this.queueSave();
					break;
				}
			}
		}
		
		/** */
		delete(index: number)
		{
			const count = this.tuples.splice(index, 1).length;
			if (count > 0)
				this.queueSave();
		}
		
		/** */
		move(targetIndex: number, newIndex: number)
		{
			if (targetIndex === newIndex)
				return;
			
			const tuple = this.tuples.splice(targetIndex, 1)[0];
			if (!tuple)
				return;
			
			const idx = newIndex + (targetIndex < newIndex ? 0 : 1);
			this.tuples.splice(idx, 0, tuple);
			this.queueSave();
		}
		
		/** */
		private queueSave()
		{
			clearTimeout(this.timeoutId);
			
			this.timeoutId = setTimeout(() =>
			{
				Store.current().set(this.streamKey, this.tuples);
			},
			10);
		}
		private timeoutId: any = 0;
	}
	
	/** */
	export interface PostStreamRecordFuture
	{
		getScene(): Promise<SceneRecord>;
		getPost(): Promise<PostRecord>;
		getPartialPost(): Promise<PartialPostRecord>;
	}
	
	const tupleSeparator = ":";
}
