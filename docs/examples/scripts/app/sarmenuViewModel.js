define(function(require) {
    'use strict';

    var ko = require('knockout'),
        s = require('sarmenu');

    function ViewModel() {
        var self = this;

        this.simple = new s.Sarmenu({
            options: {
                slide: true,
                overlay: true,
                overlayDepth: '100',
                overlayTarget: '#app',
                overlayWrapClasses: ['overlay-wrapper'],
                overlayClasses: ['overlay'],
                click: function() {
                    self.simple.close();
                }
            }
        });

        this.item1 = function() {
            alert('item 1');
        };

        this.item2 = function() {
            alert('item 2');
        };

    }

    return {
        ViewModel: ViewModel
    };
});