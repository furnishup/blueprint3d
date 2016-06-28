module.exports = function (grunt) {

  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

  var tSources = ["*.ts", "*/*.ts"]

  grunt.initConfig({
    typescript: {
      options: {
        target: "es5",
        declaration: true,
        removeComments: true
      },

      Blueprint3d: {
        src: tSources,
        dest: "../bin/blueprint3d.js"
      }
    },

    min: {
      Blueprint3d: {
        src: "../bin/blueprint3d.js",
        dest: "../bin/blueprint3d.min.js"
      }
    },

    typedoc: {
      options: {
        name: "Blueprint3d",
        target: "es5",
        mode: "file",
        readme: "none"
      },

      Blueprint3d: {
        options: {
          out: "../doc/Blueprint3d",
          name: "Blueprint3d"
        },
        src: tSources
      }
    }
  });

  grunt.registerTask("debug", [
    "typescript:Blueprint3d"
  ]);

  grunt.registerTask("release",
    ["debug",
      "min:Blueprint3d",
      "typedoc:Blueprint3d"
    ]);

  grunt.registerTask("default", [
    "debug"
  ]);
};