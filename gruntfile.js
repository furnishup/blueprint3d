module.exports = function (grunt) {

  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

  var tSources = ["src/*.ts", "src/*/*.ts"]

  var globalConfig = {
    moduleName: "blueprint3d",
    docDir: "doc",
    outDir: "dist",
    exampleDir: "example/js/",
    sources: tSources
  };

  grunt.initConfig({

    globalConfig: globalConfig,

    clean: [globalConfig.outDir, globalConfig.docDir],

    copy: {
      blueprint3d: {
        src: globalConfig.outDir + "/" + globalConfig.moduleName + ".js",
        dest: globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js"
      }
    },

    typescript: {
      options: {
        target: "es5",
        declaration: true,
        sourceMap: true,
        removeComments: false
      },

      blueprint3d: {
        src: globalConfig.sources,
        dest: globalConfig.outDir + "/" + globalConfig.moduleName + ".js"
      }
    },

   typedoc: {
      options: {
        name: globalConfig.moduleName,
        target: "es5",
        mode: "file",
        readme: "none"
      },

      blueprint3d: {
        options: {
          out: globalConfig.docDir + "/" + globalConfig.moduleName,
          name: globalConfig.moduleName
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

      blueprint3d: {
        files: {
          "dist/blueprint3d.min.js": globalConfig.outDir + "/" + globalConfig.moduleName +".js"
        }
      }
    }
  });

  grunt.registerTask("debug", [
    "typescript:" + globalConfig.moduleName
  ]);

  grunt.registerTask("example", [
    "copy:" + globalConfig.moduleName
  ]);

  grunt.registerTask("release", [
    "clean",
    "debug",
    "uglify:" + globalConfig.moduleName,
    "typedoc:" + globalConfig.moduleName
  ]);

  grunt.registerTask("default", [
    "debug"
  ]);
};