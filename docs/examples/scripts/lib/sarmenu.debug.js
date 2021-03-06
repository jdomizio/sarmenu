(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(['knockout', 'jquery'], factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        if(typeof root.ko === 'undefined') {
            throw new Error('knockoutjs is required for sarmenu.');
        }
        if(typeof root.jQuery === 'undefined') {
            throw new Error('jQuery is required for sarmenu.');
        }
        root.sarmenu = factory(root.ko, root.$);
    }
}(this, function (ko, $) {/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond", function(){});

/**
 * Created by jdomizio on 1/2/2015.
 */
define('sarmenu-main', ['require','sarmenu','dropoverlay','config'],function(require) {

    var Sarmenu = require('sarmenu'),
        DropOverlay = require('dropoverlay'),
        config = require('config');

    return {
        Sarmenu: Sarmenu,
        DropOverlay: DropOverlay,
        config: config
    };
});
define("src/all", function(){});

/**
 * Created by Cristel on 1/3/2015.
 */
define('config', ['require'],function(require) {

    var config = {

        /** Allows multiple instances of the sarmenu to be open at once */
        'allowMultipleMenus': true
    };

    return config;
});
define("src/config", function(){});

/**
 * Created by jdomizio on 1/2/2015.
 */
define('dropoverlay', ['require'],function(require) {
    

    function DropOverlay() {
        this.isShowing = false;
        this.currentTimeout = null;
        this.currentOverlay = null;
    }

    DropOverlay.prototype.hide = function(time) {
        var self = this;

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
define("src/dropoverlay", function(){});

/**
 * Created by jdomizio on 12/31/2014.
 */
define('sarmenu', ['require','dropoverlay','util','config'],function(require) {
    

    var DropOverlay = require('dropoverlay'),
        util = require('util'),
        globalConfig = require('config');

    var sharedOverlay = new DropOverlay();

    var SARMENU_DEFAULT_OPT = {};

    var globalState = {
        getNextId: (function() {
            var id = ko.observable(1);
            return function() {
                var usedId = id();
                id(usedId + 1);
                return usedId;
            };
        })(),

        current: ko.observable()
    };

    function Sarmenu(params) {
        params = params || {};

        this._id = globalState.getNextId();
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
        globalState.current(this._id);
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

        if(!globalConfig.allowMultipleMenus) {
            globalState.current.subscribe(function(current) {
                if(current !== self._id) {
                    self.close();
                }
            });
        }
    };

    ko.bindingHandlers['sarmenu'] = {
        'init': util.bindingHandler(Sarmenu, 'init')
    };

    return Sarmenu;
});
define("src/sarmenu", function(){});

define('util', ['require'],function(require) {

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
define("src/util", function(){});

//The modules for your project will be inlined above
//this snippet. Ask almond to synchronously require the
//module value for 'main' here and return it as the
//value to use for the public API for the built file.
return require('sarmenu-main');
}));