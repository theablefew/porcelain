module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {},
      dist: {
        src: [
            'src/porcelain/Porcelain.js'
          , 'src/porcelain/Util.js'
          , 'src/porcelain/BaseChart.js'
        ],
        dest: 'vendor/assets/javascripts/<%= pkg.name %>/<%= pkg.name %>.js',
      }
    },
    uglify: {
      options: {
        banner: '/*!\n <%= pkg.name %>\n * Version: <%= pkg.version %> \n * Built: <%= grunt.template.today("yyyy-mm-dd") %> \n */\n'
      },
      build: {
        src:  'vendor/assets/javascripts/<%= pkg.name %>/<%= pkg.name %>.js',
        dest: 'vendor/assets/javascripts/<%= pkg.name %>/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);

};