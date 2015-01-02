; (function() {

    require.config({
        baseUrl: 'scripts',
        paths: {
            'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min',
            'knockout': '//ajax.aspnetcdn.com/ajax/knockout/knockout-3.1.0',
            'sarmenu': 'lib/sarmenu'
        }
    });

    require(['./app/app']);
})();
