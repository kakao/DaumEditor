/**
 * Created by sungwon on 14. 9. 15.
 */
module.exports = function(grunt){
    grunt.initConfig({
        buildConfig : grunt.file.readJSON('build.json'),
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            core: {
                files: [
                    {
                        src: '<%= buildConfig.src.editor.js.files %>',
                        dest: '<%= buildConfig.build.target.js.merged.dir %>/core_editor.js'
                    }
                    ,{
                        src: '<%= buildConfig.src.popup.js.files %>',
                        dest: '<%= buildConfig.build.target.js.merged.dir %>/core_popup.js'
                    }
                ]
            },
            js: {
                options: {
                    separator: ';',
                    banner: '(function(){',
                    footer: 'if (typeof Editor !== "undefined") Editor.version = "<%= pkg.version %>";})();'
                },
                files:[
                    {
                        src: ['<%= buildConfig.src.editor.js.dir %>/trex/eval.js',
                            '<%= buildConfig.src.editor.js.dir %>/trex/header.js',
                            '<%= buildConfig.build.target.js.merged.dir %>/core_editor.js',
                            '<%= buildConfig.src.editor.js.dir %>/trex/footer.js'
                        ],
                        dest: '<%= buildConfig.build.target.js.merged.dir %>/editor.js'
                    },{
                        src: ['<%= buildConfig.src.editor.js.dir %>/trex/eval.js',
                            '<%= buildConfig.src.editor.js.dir %>/trex/header.js',
                            '<%= buildConfig.build.target.js.merged.dir %>/core_popup.js',
                            '<%= buildConfig.src.editor.js.dir %>/trex/footer.js'
                        ],
                        dest: '<%= buildConfig.build.target.js.merged.dir %>/popup.js'
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.version %>*/\n'
            },
            js: {
                expand: true,
                cwd: '<%= buildConfig.build.target.js.escaped.dir %>/',
                src:['**/*.js'],
                dest: '<%= buildConfig.build.target.js.minified.dir %>/'
            }
        },
        native2ascii: {
            options: {},
            js: {
                expand: true,
                cwd: '<%= buildConfig.build.target.js.merged.dir %>/',
                src:['**/*.js', '!core_editor.js', '!core_popup.js'],
                dest: '<%= buildConfig.build.target.js.escaped.dir %>/'
            }
        },
        'string-replace': {
            js: {
                expand: true,
                cwd: '<%= buildConfig.build.target.js.escaped.dir %>/',
                src:['**/*.js'],
                dest: '<%= buildConfig.build.target.js.escaped.dir %>/',
                options: {
                    replacements: [{
                        pattern: /console\.\w{3,6}\([^)]*\);?/ig,
                        replacement: ''
                    }, {
                        pattern: 'debugger;',
                        replacement: ''
                    }]
                }
            }
        },
        clean: {
            setup:["<%= buildConfig.build.target.dir %>", "<%= buildConfig.build.dist.dir %>"]
        },
        copy: {
            js: {
                expand: true,
                cwd:'<%= buildConfig.src.editor.js.dir %>/',
                src: ['editor_loader.js','editor_creator.js', '**/async/*.js'],
                dest: '<%= buildConfig.build.target.js.merged.dir %>/'
            },
            package:{
                files:[
                    {
                        expand: true,
                        cwd:'<%= buildConfig.build.target.js.minified.dir %>/',
                        src: ['**/*.js'],
                        dest: '<%= buildConfig.build.dist.dir %>/js/'
                    },
                    {
                        expand: true,
                        cwd:'<%= buildConfig.build.target.css.minified.dir %>/',
                        src: ['**/*.css'],
                        dest: '<%= buildConfig.build.dist.dir %>/css/'
                    },
                    {
                        expand: true,
                        cwd:'<%= buildConfig.src.editor.dir %>/',
                        src: ['**/images/**','**/pages/**', 'editor.html'],
                        dest: '<%= buildConfig.build.dist.dir %>/'
                    }
                ]
            }
        },
        concat_css:{
            css: {
                expand: true,
                cwd:'<%= buildConfig.src.editor.css.dir %>/',
                src:['editor.css','popup.css','content_view.css','content_wysiwyg.css'],
                dest:'<%= buildConfig.build.target.css.merged.dir %>/'
            }
        },
        cssmin:{
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.version %>*/\n'
            },
            css: {
                expand: true,
                cwd: '<%= buildConfig.build.target.css.merged.dir %>/',
                src:['**/*.css'],
                dest: '<%= buildConfig.build.target.css.minified.dir %>/'
            }
        },
        compress:{
            package:{
                options: {
                    archive: '<%= buildConfig.build.dist.dir %>/daumeditor.zip'
                },
                expand: true,
                cwd: '<%= buildConfig.build.dist.dir %>/',
                src: ['**','!**/*.zip'],
                dest: ''
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-native2ascii');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('setup', 'setup modules', function(){
        var dir = grunt.config.get('buildConfig.src.editor.js.dir');
        var editor = require('./'+grunt.config.get('buildConfig.src.editor.js.dir') + '/editor.js');
        var popup = require('./'+grunt.config.get('buildConfig.src.editor.js.dir') + '/popup.js');
        grunt.config.set('buildConfig.src.editor.js.files', editor.CORE_FILES.filter(function(v){
            var ex = editor.EXCLUDE_FILES||[];
            ex.push('lib/firebug/firebug.js');
            ex.push('trex/eval.js');
            return (ex).indexOf(v) == -1;
        }).map(function(v){
            return dir+'/'+v;
        }));
        grunt.config.set('buildConfig.src.popup.js.files', popup.CORE_FILES.filter(function(v){
            var ex = editor.EXCLUDE_FILES||[];
            ex.push('lib/firebug/firebug.js');
            ex.push('trex/eval.js');
            return (ex).indexOf(v) == -1;
        }).map(function(v){
            return dir+'/'+v;
        }));
    });
    grunt.registerMultiTask('concat_css', 'merge css files', function(){
        function getCssText(filename) {
            var orig = grunt.file.read(filename).toString();
            orig = orig.replace(/\/\*[\s\S]*?\*\//g, "");
            orig = orig.replace(/\.\.\/\.\.\/\.\.\/images/g, grunt.config.get('buildConfig.build.link.image.url'));
            orig = orig.replace(/@import\s+url\(([\.\/\w_]+)\);?\n?/g, function (full, importFile) {
                return getCssText(filename.replace(/[\w_]+\.css/, importFile));
            });
            return orig;
        }
        this.files.forEach(function(f){
            f.src.forEach(function(filename){
                var str = getCssText(filename);
                grunt.file.write(f.dest, str);
                grunt.log.writeln('File ' + filename + ' created.');
            })

        });
    });
    grunt.registerTask('make_js',['concat:core', 'concat:js','copy:js', 'native2ascii:js', 'string-replace:js', 'uglify:js']);
    grunt.registerTask('make_css', ['concat_css:css', 'cssmin:css']);
    grunt.registerTask('make_package', ['copy:package', 'compress:package']);
    grunt.registerTask('default', ['clean:setup', 'setup', 'make_js', 'make_css', 'make_package']);
};