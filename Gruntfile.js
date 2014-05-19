module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*!\n <%= pkg.name %>\n * Version: <%= pkg.version %> \n * Built: <%= grunt.template.today("yyyy-mm-dd") %> \n */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);

};