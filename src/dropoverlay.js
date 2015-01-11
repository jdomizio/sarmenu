/**
 * Created by jdomizio on 1/2/2015.
 */
define('dropoverlay', function(require) {
    'use strict';

    var instances = 0;

    console.trace = console.trace || console.log;

    function DropOverlay() {
        this.isShowing = false;
        this.currentTimeout = null;
        this.currentOverlay = null;
        instances += 1;
    }

    DropOverlay.prototype.hide = function(time) {
        var self = this;

        console.trace('(hide) currentTimeout: ' + this.currentTimeout);
        time = arguments.length ? time : 100;

        this.currentTimeout = window.setTimeout(function() {
            $('.kobs-overlay').fadeOut(time, function () {
                $(this).remove();
            });
            self.isShowing = false;
            self.currentTimeout = null;
            self.currentOverlay = null;
        }, 200);
    };

    DropOverlay.prototype.create = function($element, options) {
        var container, i, len;

        console.trace('(create) currentTimeout: ' + this.currentTimeout);
        if(this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            $(this.currentOverlay).off('click touchstart');
            if(options.click) {
                $(this.currentOverlay).on('click touchstart', function(e) {
                    options.click(e);
                });
            }
            return;
        }

        container = $('<div/>');
        container.addClass('kobs-overlay');
        if(options.overlayWrapClasses) {

            for(i = 0, len = options.overlayWrapClasses.length; i < len; ++i) {
                container.addClass(options.overlayWrapClasses[i]);
            }
        }
//            if(options.overlayDepth) {
//                container.attr('style', 'z-index: ' + options.overlayDepth + ' !important;');
//            }

        var overlay = $('<div/>');
        if(options.overlayClasses) {

            for(i = 0, len = options.overlayClasses.length; i < len; ++i) {
                overlay.addClass(options.overlayClasses[i]);
            }
        }
        if(options.overlayDepth) {
            overlay.attr('style', 'z-index: ' + options.overlayDepth + ' !important;');
        }

        container.append(overlay);

        if(options.click) {
            container.on('click touchstart', function(e){
                options.click(e);
            });
        }

        this.currentOverlay = container;

        $element.append(container).fadeIn(100);
        this.isShowing = true;
    };

    return DropOverlay;
});