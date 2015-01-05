/**
 * Created by Jason on 8/24/2014.
 */
define(function(require) {

    var sarmenu = require('./sarmenuViewModel'),
        TwoMenus = require('./twoMenus');

    function AppViewModel() {
        this.sarmenu = new sarmenu.ViewModel();
        this.twomenus = new TwoMenus();
    }

    return AppViewModel;
});
