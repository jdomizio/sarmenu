/**
 * Created by jdomizio on 1/2/2015.
 */
define('sarmenu-main', function(require) {

    var Sarmenu = require('sarmenu'),
        DropOverlay = require('dropoverlay'),
        config = require('config');

    return {
        Sarmenu: Sarmenu,
        DropOverlay: DropOverlay,
        config: config
    };
});