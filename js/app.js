//Main app file.
//To load a module for the app, place it in the app/ directory that is a
//sibling to this file. For any third party dependencies, like jQuery,
//place them in the same directory as this file.

//Example call to start script loading of jquery.js and app/sub.js,
//assuming they exist in the project:
require.config({
  paths: {
    "templates": "../templates"
  }
});


requirejs(['jquery', 'app/game'], function ($, game) {
  $(document).ready(function () {
    game.go();
  });
});
