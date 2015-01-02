define(function(require) {
    var ko = require('knockout'),
        App = require('./appViewModel');

    ko.applyBindings(new App(), document.getElementById('app'));
});
