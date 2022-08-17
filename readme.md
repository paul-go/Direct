
# Direct

Direct is an experimental website builder and blogging engine.

Unlike other blogging engines (such as WordPress and Ghost) that focus on long-form text articles, Direct is designed to create short-form, easy-to-create content, such as the kind of content you would find on most social media sites. Want to post a video or a series of images from a trip? Or maybe a quick blurb about your thoughts on a particular topic? This is more difficult than it ought to be in WordPress. In Direct, it's a few clicks.

Unlike other website builders, Direct is scene-based. Each page you post is constructed from one or more scenes which consume the whole screen, which your viewer can swipe though vertically, similar to the TikTok video feed experience. Direct has 3 different kinds of scenes:

- *Canvas scenes* – Arrange custom background images and overlay titles, descriptions, call-to-action buttons ontop of them.

- *Gallery scenes* – Arrange one or more images or videos in a horizontally swipable gallery, similar to how Instagram posts.

- *Prose scenes* – Write out your thoughts in an editor with some basic formatting (headings, paragraphs, bold, links, etc)

Direct is also completely client-side. There's no need for a server at all (unless you want to publish somewhere). In fact, if you clone this repository and build, you can simply drag the `/build/index.html` file directly into a browser, and the web version of the app will operate with full fidelity.

## Current State: Alpha

Direct is current in an alpha state. It's being used to build the website at [https://www.directblog.org](https://www.directblog.org). If you want to try the web version, it is available [here](https://app.directblog.org). For the optimal experience on macOS, there is a desktop macOS app. This app is built using Tauri rather than Electron, so the memory footprint is minimal.
