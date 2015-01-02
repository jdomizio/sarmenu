/**
 * Created by Jason on 8/24/2014.
 */
define(function(require) {

    var sarmenu = require('./sarmenuViewModel');

    function AppViewModel() {
        this.sarmenu = new sarmenu.ViewModel();
    }

    return AppViewModel;
});
