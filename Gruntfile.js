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
        dest: 'build/Porcelain.js',
      }
    },
    uglify: {
      options: {
        banner: '/*!\n <%= pkg.name %>\n * Version: <%= pkg.version %> \n * Built: <%= grunt.template.today("yyyy-mm-dd") %> \n */\n'
      },
      build: {
        src:  'build/<%= pkg.name %>/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);

};