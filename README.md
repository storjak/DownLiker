# DownLiker

This userscript app is meant to enable quick, full-res media downloads from twitter.com.  When you like a post, all the media content for that post is conveniently downloaded to your computer at the same time.

## Notice

This app isn't finished yet and it's very buggy.  At the moment it can download an image, image collections, and GIFs as MP4's.  Video download support is currently being built.  If there are any features you'd like to see worked in let me know or submit a PR of your own.  At this moment it ONLY works with Tampermonkey, *not* Greasemonkey, as the site recognition regex is different.

## Issues

* Doesn't work with videos.
* Breaks on page changes.  Twitter is a React site so when the DOM changes the extension gets destroyed and does not recreate itself.
* If there are any images other than the media embedded in a tweet, such as another tweet, it will download *all* the images.  It's not supposed to do this.
* It does not work for GIFs if the GIF is playing, only if the GIF has not been clicked yet.
* Doesn't work with Greasemonkey

## Timeline

1. Currently working on implementing video downloads
2. Add support for downloading playing GIFs and videos
3. Don't download embeds in the tweet
4. Persist through page changes
5. Make it work with Greasemonkey

## Most Recent Update

1. Added support for multiple views, such as enlarged image and image galleries
2. Made the slider match the page better

Program last updated 20220131

Readme last updated 20220131