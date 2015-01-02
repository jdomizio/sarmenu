; (function() {

    require.config({
        baseUrl: 'scripts',
        paths: {
            'jquery': 'lib/jquery-2.1.1',
            'knockout': 'lib/knockout-3.2.0'
        }
    });

    require(['./app/app']);
})();
