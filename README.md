# DownLiker

This userscript app is meant to enable quick, full-res media downloads from twitter.com.  When you like a post, all the media content for that post is conveniently downloaded to your computer at the same time.

## Notice

This app isn't finished yet and it's very buggy.  At the moment it can download an image, image collections, and GIFs as MP4's.  Video download support is currently being built.  If there are any features you'd like to see worked in let me know or submit a PR of your own.

## Issues

* Doesn't work with videos.
* Breaks on page changes.  Twitter is a React site so when the DOM changes the extension gets destroyed and does not recreate itself.
* If there are any images other than the media embedded in a tweet, such as another tweet, it will download *all* the images.  It's not supposed to do this.
* It does not work for GIFs if the GIF is playing, only if the GIF has not been clicked yet.
* It doesn't work on many views, such as in an enlarged image view.
* The toggle switch is basic and ugly.  It looks good enough, I don't think I'll do a major change but it needs to be cleaned up a bit.

## Timeline

1. Currently working on implementing video downloads
2. Add support for downloading playing GIFs and videos
3. Don't download embeds in the tweet
4. Work in every view
5. Persist through page changes
6. Make it look pretty