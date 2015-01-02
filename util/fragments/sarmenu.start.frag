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
}(this, function (ko, $) {