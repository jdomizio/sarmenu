/**
 * Created by jdomizio on 12/31/2014.
 */
define('sarmenu', function(require) {
    'use strict';

    var DropOverlay = require('dropoverlay'),
        util = require('util'),
        globalConfig = require('config');

    var sharedOverlay = new DropOverlay();

    var SARMENU_DEFAULT_OPT = {};

    function Sarmenu(params) {
        params = params || {};

        this.isOpen = ko.observable(false);
        this.options = params.options || SARMENU_DEFAULT_OPT;
        this.element = null;

        this.openMenu = util.getOpenMenuHandler(this.options);
        this.closeMenu = util.getCloseMenuHandler(this.options);
    }

    Sarmenu.prototype.open = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = util.getParent($element);

        $element.trigger('focus');

        if(!this.isOpen()) {
            this.openMenu($parent);
        }
        this.isOpen(true);
    };

    Sarmenu.prototype.close = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = util.getParent($element);

        if(this.isOpen()) {
            this.closeMenu($parent);
        }
        this.isOpen(false);
    };

    Sarmenu.prototype.toggle = function() {
        this.isOpen() ? this.close() : this.open();
    };

    Sarmenu.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;

        e.preventDefault();
        e.stopPropagation();

        if(!this.isOpen()) return;

        this.close();
    };

    Sarmenu.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element,
            nearestDropdown;

        params = valueAccessor();

        this.element = element;

        nearestDropdown = $(element).next('.dropdown-menu');

        ko.applyBindingsToNode(element, {
            'click': function () {
                self.toggle();
            }
        });

        $(document).on('keydown', self.keydown.bind(self));

        nearestDropdown.each(function() {
            ko.applyBindingsToNode(this, {
                'click': function() {
                    self.close();
                }
            });
        });

        if(this.options.overlay) {
            this.isOpen.subscribe(function(value) {
                if(value) {
                    sharedOverlay.create($(self.options.overlayTarget || '.kobs-overlay-target'), self.options);
                }
                else {
                    sharedOverlay.hide(0);
                }
            })
        }
    };

    ko.bindingHandlers['sarmenu'] = {
        'init': util.bindingHandler(Sarmenu, 'init')
    };

    return Sarmenu;
});