module.exports = function (grunt) {

  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

  var tSources = ["src/*.ts", "stc/*/*.ts"]

  var globalConfig = {
    moduleName: 'blueprint3d',
    docDir: 'doc',
    outDir: 'dist',
    exampleDir: 'example/js/',
    sources: ["src/*.ts", "stc/*/*.ts"]
  };

  grunt.initConfig({

    globalConfig: globalConfig,

    clean: ["<%= globalConfig.outDir %>", "<%= globalConfig.docDir %>"],

    copy: {
      "<%= globalConfig.moduleName %>": {
        src: "<%= globalConfig.outDir %>/<%= globalConfig.moduleName %>.js",
        dest: "<%= globalConfig.exampleDir %>/<%= globalConfig.moduleName %>.js"
      }
    },

    typescript: {
      options: {
        target: "es5",
        declaration: true,
        sourceMap: true,
        removeComments: false
      },

      "<%= globalConfig.moduleName %>": {
        src: globalConfig.sources,
        dest: "<%= globalConfig.outDir %>/<%= globalConfig.moduleName %>.js"
      }
    },

   typedoc: {
      options: {
        name: "<%= globalConfig.moduleName %>",
        target: "es5",
        mode: "file",
        readme: "none"
      },

      "<%= globalConfig.moduleName %>": {
        options: {
          out: "<%= globalConfig.docDir %>/<%= globalConfig.moduleName %>",
          name: "<%= globalConfig.moduleName %>"
        },
        src: tSources
      }
    },

    uglify: {
      options: {
        mangle: true,
        beautify: false,
        sourceMap: true
      },
      "<%= globalConfig.moduleName %>": {
        files: {
          '<%= globalConfig.outDir %>/<%= globalConfig.moduleName %>.min.js': '<%= globalConfig.outDir %>/<%= globalConfig.moduleName %>.js'
        }
      }
    }
  });

  grunt.registerTask("debug", [
    "typescript:<%= globalConfig.moduleName %>"
  ]);

  grunt.registerTask("example", [
    "copy:<%= globalConfig.moduleName %>"
  ]);

  grunt.registerTask("release", [
    "clean",
    "debug",
    "uglify:<%= globalConfig.moduleName %>",
    "typedoc:<%= globalConfig.moduleName %>"
  ]);

  grunt.registerTask("default", [
    "debug"
  ]);
};