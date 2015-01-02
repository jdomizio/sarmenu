/**
 * Created by jdomizio on 1/2/2015.
 */
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            'debug': {
                options: {
                    baseUrl: '.',
                    name: './node_modules/almond/almond',
                    include: ['./src/sarmenu', './src/dropoverlay', './src/all'],
                    mainConfigFile: './util/debug-config.js',
                    out: './build/<%= pkg.name %>.debug.js',
                    findNestedDependencies: false,
                    preserveLicenseComments: false,
                    paths: {
                        'knockout': 'empty:',
                        'jquery': 'empty:'
                    },
                    optimize: 'none',
                    wrap: {
                        startFile: './util/fragments/sarmenu.start.frag',
                        endFile: './util/fragments/sarmenu.end.frag'
                    }
                }
            },
            'release': {
                options: {
                    baseUrl: '.',
                    name: './node_modules/almond/almond',
                    include: ['./src/sarmenu', './src/dropoverlay', './src/all'],
                    mainConfigFile: './util/release-config.js',
                    out: './build/<%= pkg.name %>.js',
                    findNestedDependencies: false,
                    preserveLicenseComments: false,
                    wrap: {
                        startFile: './util/fragments/sarmenu.start.frag',
                        endFile: './util/fragments/sarmenu.end.frag'
                    }
                }
            }
        },
        copy: {
            'postBuild': {
                files: [
                    { expand: true, cwd: 'build', src: ['**'], dest: 'docs/examples/scripts/lib/', filter: 'isFile' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', 'Builds the project', function() {

        var taskList = [
            'requirejs:debug',
            'requirejs:release',
            'copy:postBuild'
        ];

        grunt.task.run(taskList);

    });
};