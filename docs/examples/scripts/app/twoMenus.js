/**
 * Created by Cristel on 1/3/2015.
 */
define(function(require) {
    'use strict';

    var sm = require('sarmenu');

    function TwoMenus() {
        this.menu1 = new sm.Sarmenu({
            options: { slide: true }
        });

        this.menu2 = new sm.Sarmenu({
            options: { slide: true }
        });
    }

    return TwoMenus;
});