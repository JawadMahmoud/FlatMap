module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
        foo: {
          src: ['Scripts/hotline.js', 'Scripts/main.js']
        },
        options: {
          'esversion': 6,
        }
      },
      concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: ['Scripts/hotline.js', 'Scripts/main.js'],
          dest: 'demo/<%= pkg.name %>.js'
        }
      },
      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        dist: {
          src: 'demo/<%= pkg.name %>.js',
          dest: 'demo/<%= pkg.name %>.min.js'
        }
      },
      cssmin: {
        options : {
          banner: '/* My minified css file */'
        },
        dist: {
          src: 'styles/main.css',
          dest: 'demo/<%= pkg.name %>.min.css'
        }
      },
      copy: {
        main: {
          files: [
            {expand: true, src: ['Icons/**'], dest: 'demo/'},
            {expand: true, src: ['GPXFiles/**'], dest: 'demo/'}
          ]
        }
      },
      processhtml: {
        dist: {
          src: 'index.html',
          dest: 'demo/index.html'
        }
      }
    });
  
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-jshint');
  
    //grunt.registerTask('test', ['jshint']);
  
    grunt.registerTask('buildDemo', ['jshint', 'concat', 'uglify', 'cssmin', 'copy', 'processhtml']);
  
  };