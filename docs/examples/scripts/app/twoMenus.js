/**
 * Created by Cristel on 1/3/2015.
 */
define(function(require) {
    'use strict';

    var sm = require('sarmenu');

    function TwoMenus() {
        var self = this;

        sm.config.allowMultipleMenus = false;

        this.menu1 = new sm.Sarmenu({
            options: {
                slide: true,
                overlay: true,
                overlayDepth: '100',
                overlayTarget: '#app',
                overlayWrapClasses: ['overlay-wrapper'],
                overlayClasses: ['overlay'],
                click: function() {
                    self.menu1.close();
                }
            }
        });

        this.menu2 = new sm.Sarmenu({
            options: {
                slide: true,
                overlay: true,
                overlayDepth: '100',
                overlayTarget: '#app',
                overlayWrapClasses: ['overlay-wrapper'],
                overlayClasses: ['overlay'],
                click: function() {
                    self.menu2.close();
                }
            }
        });
    }

    return TwoMenus;
});