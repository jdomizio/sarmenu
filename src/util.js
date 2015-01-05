define('util', function(require) {

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

    return {
        bindingHandler: bindingHandler,
        getParent: getParent,
        getOpenMenuHandler: getOpenMenuHandler,
        getCloseMenuHandler: getCloseMenuHandler
    };
});