# srcN Polyfill
A Responsive Images approach that you can use today that mimics the [proposed srcN syntax](http://tabatkins.github.io/specs/respimg/Overview.html).


*  Author: Barry Latimer, Merkle Inc, 2014 
* License: MIT/GPLv2

**Demo URL:** [http://jansepar.github.com/srcN Polyfill/](http://jansepar.github.com/srcN Polyfill/)

**Draft Specification:** [http://tabatkins.github.io/specs/respimg/Overview.html](http://tabatkins.github.io/specs/respimg/Overview.html)

**Note:** srcN Polyfill works best in browsers that support CSS3 media queries. The demo page references (externally) the [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) which makes matchMedia work in `media-query`-supporting browsers that don't support `matchMedia`. `matchMedia` and the `matchMedia` polyfill are not required for `srcN Polyfill` to work, but they are required to support the `media` attributes on `picture` `source` elements. In non-media query-supporting browsers, the `matchMedia` polyfill will allow for querying native media types, such as `screen`, `print`, etc.	

## Markup pattern and explanation

Mark up your responsive images like this.

```html
	<img src-1="(max-width: 30em) 100%, (max-width: 50em) 75%, 50%; images/pic-small.png 400w, images/pic-medium.png 800w, images/pic-large.png 1200w">		
```

Or with Media Queries 

```html
<img src-1="(max-width: 400px) pic-small.jpg"
       src-2="(max-width: 1000px) pic-medium.jpg"
       src="pic-large.jpg"
       alt="Obama talking to a soldier in hospital scrubs.">
```

### Explained...

Notes on the markup above...

Please consult the spec for more information on the exact syntax of srcN




### HD Media Queries

srcN Polyfill natively supports HD(Retina) image replacement.  While numerous other solutions exist, srcN Polyfill has the added benefit of performance for the user in only being served one image.

To solve the resolution use-case, the src-N attributes allow multiple urls to be provided, each with an indicator of their resolution (the ratio of image pixels to CSS pixels).

Instead of a single url, simply provide a comma-separated list of urls/resolution pairs, where each pair is a url, followed by whitespace, followed by a CSS <resolution> value. A url provided without a <resolution> is assumed to be at 1x resolution.

For example, the following code provides the same image at three different resolutions: one at "normal size", where each image pixel maps to one CSS pixel; one "high-res", which is double the size but meant to be displayed with two image pixels for every one CSS pixel; and one "low-res", which is half the size, intended for low-bandwidth situations.
```html
  <img src-1="pic.png, picHigh.png 2x, picLow.png .5x">
  ```



### Deferred loading

If srcN Polyfill is deferred until after load is fired, images will not load unless the browser window is resized.
srcN Polyfill is intentionally exposed to the global space, in the unusual situation where you might want to defer loading of srcN Polyfill you can explicitly call window.srcN().

## Support

srcN Polyfill supports a broad range of browsers and devices (there are currently no known unsupported browsers), provided that you stick with the markup conventions provided.

