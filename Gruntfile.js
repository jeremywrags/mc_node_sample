/*global module:false*/
module.exports = function( grunt ) {

	'use strict';

	require('matchdep').filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// custom tasks
	require( './grunt/release' )( grunt );
	require( './grunt/save-revision' )( grunt );

    // Yaml Ignores become the package/compress ignores
    var yamlIgnores = grunt.file.readYAML('./stackato.yml').ignores;
    var compressSrc = ["**"];

    var fileName;
    for (var ignore in yamlIgnores) {
        fileName = yamlIgnores[ignore];
        if (grunt.file.isFile(fileName)) {
            compressSrc.push('!' + fileName);
        } else if (grunt.file.isDir(fileName)) {
            compressSrc.push('!' + fileName + '/**');
        }
    }

	// Project configuration.
	grunt.initConfig({
		// Task configuration.
		pkg: grunt.file.readJSON( './package.json' ),
		paths: {
			node: './',
			client: './public/',
			dist: './public-optimized/'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			files: [
				'<%= paths.node %>config/**/*.js',
				'<%= paths.node %>controllers/**/*.js',
				'<%= paths.node %>lib/**/*.js',
				'<%= paths.node %>index.js',
				'<%= paths.node %>server.js',
				'<%= paths.node %>karma.conf.js',
				'<%= paths.client %>js/**/*.js'
			]
		},
		karma: {
			main: {
				configFile: '<%= paths.node %>karma.conf.js',
				browsers: ['PhantomJS', 'Chrome', 'Firefox'],
				singleRun: true
			}
		},
		complexity: {
			client: {
				src: [
					'<%= paths.client %>js/**/*.js',
					'!<%= paths.client %>js/main.js', // EXCLUDED: JSON AMD module
				],
				options: {
					// Recommendations taken from http://jscomplexity.org/complexity
					// Defaults taken from https://github.com/vigetlabs/grunt-complexity/blob/master/tasks/complexity.js
					errorsOnly: false, // show pretty file list
					cyclomatic: 10, // Represents the number of logical paths through the source code, is a maximum threshold, recommendation 10, default 3, bounds [1,INF)
					halstead: 20, // Represents balance of unique operators and operands, is a maximum threshold, no recommendation, default 8, bounds [0,INF)
					maintainability: 100, // Represents combination of above with lines of functional code, is a minimum threshold, recommendation 65, default 100, bounds (-INF,171]
				},
			},
		},
		requirejs: {
			compile: {
				options: {
					appDir: '<%= paths.client %>/',
					mainConfigFile: "<%= paths.client %>js/main.js",
					optimize: 'uglify2',
					optimizeCss: 'none',
					dir: '<%= paths.dist %>',
					preserveLicenseComments: false,
					generateSourceMaps: true,
					logLevel: 0,
					modules: [{ name: 'js/main' }]
				}
			}
		},
		less: {
			dist: {
				files: {
					'<%= paths.dist %>css/styles.css': [ '<%= paths.client %>css/styles.less' ],
					'<%= paths.dist %>css/errors.css': [ '<%= paths.client %>css/errors.less' ]
				},
				options: {
					compress: true
				}
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,						// Enable dynamic expansion
					cwd: '<%= paths.dist %>img',		// Src matches are relative to this path
					src: ['**/*.{png,jpg,gif}'],			// Actual patterns to match
					dest: '<%= paths.dist %>img'		// Destination path prefix
				}]
			}
		},
		clean: {
			dist: {
				src: [ "<%= paths.dist %>" ]
			},
			distLess: {
				src: [ "<%= paths.dist %>css/**/*.less" ]
			}
		},
		"git-describe": {
			"options": {
			},
			"prod": {
			}
		},
		compress : {
            main : {
                options: {
                    mode: 'zip',
                    archive: function() {
                        var pkgJson = grunt.config.get('pkg');
                        return "./package/" + pkgJson.name + '-' + pkgJson.version + '.zip';
                    }
                },
                files : [
                    { expand: true, src : compressSrc, cwd : "./" }
                ]
            }
        },
		bump: {
			options: {
				bumpVersion: true,
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release %VERSION%',
				commitFiles: ['package.json', 'bower.json'], // '-a' for all files
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: true,
				pushTo: 'upstream',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
			}
		}
	});

	// Default task.
	grunt.registerTask( 'default', [ 'tests', 'optimizeJS', 'optimizeCSS', 'imagemin:dist'] );
	grunt.registerTask( 'tests', [ 'jshint', 'karma', 'complexity:client' ] );
	grunt.registerTask( 'optimizeJS', [ 'clean:dist', 'requirejs' ] );
	grunt.registerTask( 'optimizeCSS' , [ 'less:dist', 'clean:distLess' ] );
};
