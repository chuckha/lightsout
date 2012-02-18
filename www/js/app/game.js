// An example Backbone.js game using AMD. We must use AMD-ified Underscore
// and Backbone libraries, but it's worth it!
define(function (require) {
  // Declare all the vars importing modules when necessary.
  var $ = require('jquery'),
      // Underscore comes from github.com/amdjs/backbone
      _ = require('underscore'),
      // Backbone comes from github.com/amdjs/backbone
      Backbone = require('backbone'),
      // An event dispatcher to handle events across the application.
      dispatcher = _.clone(Backbone.Events),
      // The size of the board: SIZE x SIZE.
      SIZE = 5,
      Light,
      LightView,
      Lights,
      Board,
      lights,
      go;

  // Light Model
  // -----------
  
  // The model representing each individual light.
  Light = Backbone.Model.extend({
    // Each light starts as unlit.
    defaults: {
      lit: false
    },

    // Flip the light to be on or off.
    flip: function () {
      // If the light is lit
      if (this.get('lit')) {
        // Turn it off.
        this.set({
          'lit': false
        });
      // Otherwise we can assume the light is off
      } else {
        // Turn it on.
        this.set({
          'lit': true
        });
      }
    },

    // Trigger an event of the row + column.
    // Example:
    //
    // model = {
    //   row: '1',
    //   column: '2'
    // }
    // model.dispatch() will trigger event "12"
    dispatch: function () {
      dispatcher.trigger(this.get('row') + this.get('column'));
    }
  });

  // Light View
  // ========== 

  LightView = Backbone.View.extend({
    // Since no tag element was given, it will default to a div.

    // The div will have a class name of "light"
    className: "light",

    initialize: function () {
      // Give the correct 'this' value to these functions:
      //
      // * toggle
      // * generateListeners
      // * flip
      //
      // See: http://documentcloud.github.com/backbone/#FAQ-this
      _.bindAll(this, 'toggle', 'setListeners', 'flip');

      // Listen for a specific event for each light.
      this.setListeners(this.model.get('row'), this.model.get('column'));
      
      // Bind the render function to the changing of the model's lit property.
      this.model.bind("change:lit", this.render, this);
    },

    // Create the events this view will listen for.
    events: {
      // Listen for a click event on this view's element and call this.toggle
      "click" : 'toggle'
    },
    
    // Toggle is called when a click event on the view happens. Toggle will
    // trigger the model to call 'dispatch'
    toggle: function () {
      this.model.dispatch();
    },

    // Set the listeners for each Light View.
    // Note: There are optimazations that could be made here, but I chose to 
    // favor straight-forward code rather than optimize.
    setListeners: function (row, column) {
      // Listen for an event triggered by the view above.
      dispatcher.on((row - 1) + column, this.flip);
      // Listen for an event triggerd by the view to the left.
      dispatcher.on(row + (column - 1), this.flip);
      // The next two are a bit silly, see https://gist.github.com/1856747
      // Remember, both 'row' and 'column' are strings.
      // Listen for an event triggerd by the view below.
      dispatcher.on((parseInt(row, 10) + 1) + column, this.flip); 
      // Listen for an event triggered by the view to the right.
      dispatcher.on(row + (parseInt(column, 10) + 1), this.flip);
      // Listen for an event triggered by this view.
      dispatcher.on(row + column, this.flip);
    },

    // Call 'flip' on the view's associated model.
    flip: function () {
      this.model.flip();
    },

    // Set the class to 'on'.
    render: function () {
      $(this.el).toggleClass("on", this.model.get('lit'));
      return this;
    }
  });

  // A Collection of Lights
  // ======================

  Lights = Backbone.Collection.extend({
    // This collection is associated with the Light model.
    model: Light,

    // This sets the initial state of the puzzle.
    // puzzle will be passed in as an associative array where the keys
    // are rows and values in the array are the columns.
    // Example:
    // { 1: [1, 2],
    //   2: [2, 3] }
    // Means the row at index 1 will have two lights on. Those two lights are
    // the lights in column 1 and column 2. Row 2 will also have two lights on,
    // the lights in column 2 and column 3.
    setPuzzle: function (puzzle) {
      var lights, lightRow, lightCol;
      // We want a subset of the lights in the collection so we use a filter.
      lights = this.filter(function (light) {
        // Get the row of the current light
        lightRow = light.get('row');
        // Get the column of the current light
        lightCol = parseInt(light.get('column'), 10);
        // If the row of the light is a key in the associative array puzzle
        if (lightRow in puzzle && 
            // And the array of column indexes contains the light's column
            // index.
            puzzle[lightRow].indexOf(lightCol) > -1) {
          // Add the light to the filtered set of lights.
          return light;
        }
      });

      // Call 'dispatch' on each of the lights returned from the filter.
      _.invoke(lights, 'dispatch');
    }
  });

  // Create the collection instance.
  lights = new Lights();

  // Board View
  // ==========
  // This is the collection level view that will render the actual game.
  Board = Backbone.View.extend({
    // The id of this.el will be "game"
    id: 'game',

    initialize: function () {
      // When a light is added to the collection 'lights', call Board's add
      // method.
      lights.on('add', this.add, this);
    },

    // This is triggered when a light is added to the colleciton.
    add: function (light) {
      // Create a view for the model that was added.
      var lightView = new LightView({
        // Associate the view with a model.
        model: light
      });
      // Render the element and attach it to the Board View.
      $(this.el).append(lightView.render().el);
    }
  });
  
  // go
  // ==
  // Run the game.
  go = function () {
    var board,
      i, j;

    // Instantiate the board.
    board = new Board();

    // Add 5 rows of lights
    for (i = 0; i < SIZE; i ++) {
      // For each row add 5 columns of lights
      for(j = 0; j < SIZE; j++) {
        // That makes for 25 iterations of this call.
        lights.add(new Light({
          // Set the row and column to be strings. I do this because it is 
          // easier to concatenate strings than integers.
          row: i.toString(10),
          column: j.toString(10)
        }));
      }
    }
    // The basic setup is done here. We could render it and all the lights
    // would be off and that would be no fun!

    // Define the puzzle we want to solve.
    var puzzle = {
       1: [1, 2, 3, 4],
       2: [1, 2, 3, 4],
       3: [1, 2, 3, 4]
    };
    
    // Set the puzzle
    lights.setPuzzle(puzzle);
    
    // Render the puzzle after it has been set
    $('header').after(b.el);
  };

  // Return the function to run the game.
  return go;
});
