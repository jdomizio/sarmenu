/**
 * Created by jdomizio on 12/31/2014.
 */
define('sarmenu', function(require) {
    'use strict';

    var DropOverlay = require('dropoverlay');

    var sharedOverlay = new DropOverlay();

    function bindingHandler(Type, method) {
        return function (element, valueAccessor, allBindings) {
            var params = valueAccessor(),
                instance;

            instance = (params instanceof Type) ? params : new Type();

            return instance[method](element, valueAccessor, allBindings);
        };
    }

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }

    function getOpenMenuHandler(options) {
        options = options || {};

        if(options.slide) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).slideDown();
            };
        }
        else if(options.fade) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).fadeIn();
            };
        }
        return function($element) {
            $element.toggleClass('open');
        };
    }

    function getCloseMenuHandler(options) {
        options = options || {};

        if(options.slide) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).slideUp();
            };
        }
        else if(options.fade) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).fadeOut();
            };
        }
        return function($element) {
            $element.toggleClass('open');
        };
    }

    function Sarmenu(params) {
        params = params || {};

        this.isOpen = ko.observable(false);
        this.options = params.options;
        this.element = null;

        this.openMenu = getOpenMenuHandler(this.options);
        this.closeMenu = getCloseMenuHandler(this.options);
    }

    Sarmenu.prototype.open = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = getParent($element);

        $element.trigger('focus');

        if(!this.isOpen()) {
            this.openMenu($parent);
        }
        this.isOpen(true);
    };

    Sarmenu.prototype.close = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = getParent($element);

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
        'init': bindingHandler(Sarmenu, 'init')
    };

    return Sarmenu;
});