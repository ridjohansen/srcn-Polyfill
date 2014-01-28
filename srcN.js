/*! srcN - Responsive Images that work today.
 *  Author: Barry Latimer, Merkle Inc, 2014 
 *  License: MIT/GPLv2
 *  Spec: http://tabatkins.github.io/specs/respimg/Overview.html
 *  Based on Picture polyfill by Scott Jehl, Filament Group, 2012 (https://github.com/jansepar/picturefill)
 */

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

(function(w, doc) {
    // Enable strict mode
    "use strict";

    var img;
    w.srcsetSupported = function() {
        img = img || new Image();
        return 'srcset' in img;
    }

    /*
     * Shortcut method for matchMedia (for easy overriding in tests)
     */
    w._matchesMedia = function(media) {
        return w.matchMedia && w.matchMedia(media).matches;
    }

    /*
     * Shortcut method for `devicePixelRatio` (for easy overriding in tests)
     */
    w._getDpr = function() {
        return (window.devicePixelRatio || 1);
    }

    /** 
     * Get width in css pixel value from a "length" value
     * http://dev.w3.org/csswg/css-values-3/#length-value
     */
    var lengthEl;
    w._getCachedLengthEl = function() {
        lengthEl = lengthEl || document.createElement('div');
        if (!doc.body) {
            return;
        }
        doc.body.appendChild(lengthEl);
        return lengthEl;
    } 
    w._getWidthFromLength = function(length) {
        var lengthEl = w._getCachedLengthEl();
        lengthEl.style.cssText = 'width: ' + length + ';';
        // Using offsetWidth to get width from CSS
        return lengthEl.offsetWidth;
    };

    /*
     * Takes a string of sizes and returns the width in pixels as an int
     */
    w._findWidthFromSourceSize = function(sourceSizeListStr) {
        // Split up source size list, ie (max-width: 30em) 100%, (max-width: 50em) 50%, 33%
        var sourceSizeList = sourceSizeListStr.trim().split(/\s*,\s*/);
        var winningLength;
        for (var i=0, len=sourceSizeList.length; i < len; i++) {
            // Match <media-query>? length, ie (min-width: 50em) 100%
            var sourceSize = sourceSizeList[i];
            
            // Split "(min-width: 50em) 100%" into separate strings
            var match = /(\([^)]+\))?\s*([^\s]+)/g.exec(sourceSize);
            if (!match) {
                continue;
            }
            var length = match[2];
            var media;
            if (!match[1]) {
                // if there is no media query, choose this as our winning length
                winningLength = length;
                break;      
            } else {
                media = match[1];
            }

            if (w._matchesMedia(media)) {
                // if the media query matches, choose this as our winning length
                // and end algorithm
                winningLength = length;
                break;
            }
        }

        // default to 300px if no length was selected
        if (!winningLength) {
            return 300;
        }

        // pass the length to a method that can properly determine length
        // in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
        var winningLengthInt = w._getWidthFromLength(winningLength);
        return winningLengthInt;
    };

    /**
     * Takes a srcset in the form of url/
     * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
     *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
     *     "images/pic-small.png"
     * Get an array of image candidates in the form of 
     *      {url: "/foo/bar.png", resolution: 1}
     * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
     * If sizes is specified, resolution is calculated
     */
    w._getCandidatesFromSourceSet = function(srcset, sizes) {
        var candidates = srcset.trim().split(/\s*,\s*/);
        var formattedCandidates = [];
        if (sizes) {
            var widthInCssPixels = w._findWidthFromSourceSize(sizes);
        }
        for (var i = 0, len = candidates.length; i < len; i++) {
            var candidate = candidates[i];
            var candidateArr = candidate.split(/\s+/);
            var sizeDescriptor = candidateArr[1];
            var resolution;
            if (sizeDescriptor && (sizeDescriptor.slice(-1) === 'w' || sizeDescriptor.slice(-1) === 'x')) {
                sizeDescriptor = sizeDescriptor.slice(0, -1);
            }
            if (sizes) {
                // get the dpr by taking the length / width in css pixels
                resolution = parseFloat((parseInt(sizeDescriptor, 10)/widthInCssPixels).toFixed(2));
            } else {
                // get the dpr by grabbing the value of Nx
                resolution = sizeDescriptor ? parseFloat(sizeDescriptor, 10) : w._getDpr();
            }

            var formattedCandidate = {
                url: candidateArr[0],
                resolution: resolution
            };
            formattedCandidates.push(formattedCandidate);
        }
        return formattedCandidates;
    };

    w._parseSrcTag = function(srcTag) {
        var tag = { media : "", sizes : "", srcset : ""};
        var match = /(\([^)]+\))?\s*([^\s]+)/g.exec(srcTag.trim());
        if ( srcTag.indexOf(";") > -1)
        {
            var indx = srcTag.indexOf(";");
            // Size list
            tag.sizes = srcTag.slice(0, indx);
            tag.srcset = srcTag.slice(indx +1 , srcTag.length);
        }
        else if (match) {
            tag.srcset = match[2];
            var media;
            if (match[1]) {
                tag.media = match[1];
            }           
        }
        return tag;
    };

    w.srcN = function() {
        var candidates;
        // Loop through all images on the page that are `<img>` 
        var pictures = doc.getElementsByTagName("img");
        for (var i=0, plen = pictures.length; i < plen; i++) {
            var picture = pictures[i];
            if (picture.nodeName !== 'IMG') {
                continue;
            }

            var matches = [];
            var sources = picture.attributes;
            // Go through each child, and if they have media queries, evaluate them
            // and add them to matches
            for (var j=0, slen = sources.length; j < slen; j++) {
                var source = sources[j];
                if (!source.nodeName.startsWith("src-")) {
                    continue;
                }

                // parse into srcset and sizes
                matches.push(w._parseSrcTag(source.value));
            }

            for (var j=0, slen = matches.length; j < slen; j++) { 
                var matchedTag = matches[j];
                if ( matchedTag.media && w._matchesMedia(media)) {
                    candidates = matchedTag._getCandidatesFromSourceSet(matchedTag.srcset);
                    break;
                }
                else if ( matchedTag.sizes !== "")
                {
                    candidates = w._getCandidatesFromSourceSet(matchedTag.srcset, matchedTag.sizes);
                    break;
                }
            }

            if (candidates){
                // Sort image candidates before figuring out which one to use
                var sortedCandidates = candidates.sort(function(a, b) {
                    return a.resolution > b.resolution;
                });
                // Determine which image to use based on image candidates array
                for (var j=0; j < sortedCandidates.length; j++) {
                    var candidate = sortedCandidates[j];
                    if (candidate.resolution >= w._getDpr()) {
                        picture.src = candidate.url;
                        break;
                    }
                }
            }
        }
    };

    // Run on resize and domready (w.load as a fallback)
    if( w.addEventListener ){
        w.addEventListener( "resize", w.srcN, false );
        w.addEventListener( "DOMContentLoaded", function(){
            w.srcN();
            // Run once only
            w.removeEventListener( "load", w.srcN, false );
        }, false );
        w.addEventListener( "load", w.srcN, false );
    }
    else if( w.attachEvent ){
        w.attachEvent( "onload", w.srcN );
    }

})(this, document);
