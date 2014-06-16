module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {},
      dist: {
        src: [
            'src/porcelain/porcelain.js'
          , 'src/porcelain/util.js'
          , 'src/porcelain/base_chart.js'
          
          , 'src/charts/bar_chart.js'
          , 'src/charts/horizontal_bar.js'
          , 'src/charts/pie_chart.js'

          , 'src/plugins/callout.js'
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
