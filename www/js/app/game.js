// An example Backbone.js game using AMD.
define(function (require) {
  // Declare all the vars importing modules when necessary.
  var $ = require('jquery'),
      _ = require('underscore'),
      Backbone = require('backbone'),
      // An event dispatcher to handle events across the application.
      dispatcher = _.clone(Backbone.Events),
      // The size of the board.
      // It will always be a square.
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

  // The View for the light model.
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
    
    // This is the function that is called when a click event happens on this 
    // view's element. This function will call a method on the model.
    toggle: function () {
      this.model.dispatch();
    },

    // Set the listeners for the current lightView
    setListeners: function (row, column) {
      // If this light is not on the first row,
      if (row > 0) {
        // listen for an event that comes from the light above.
        dispatcher.on((row - 1) + column, this.flip);
      }
      // If this light is not on the last row,
      if (row < SIZE) {
        // listen for an event coming from the light below.
        dispatcher.on((parseInt(row, 10) + 1) + column, this.flip); 
      }
      // If this light is not on the first column,
      if (column > 0) {
        // listen for an event from the light to the left.
        dispatcher.on(row + (column - 1), this.flip);
      }
      // If this light is not on the last column,
      if (column < SIZE) {
        // listen for an event from the light to the right.
        dispatcher.on(row + (parseInt(column, 10) + 1), this.flip);
      }
      // Listen to the event that is dispatched when this light is clicked.
      dispatcher.on(row + column, this.flip);
    },

    // Tell the model to toggle off or on
    // If you bind this.model.flip to an event, the context will be wrong.
    flip: function () {
      this.model.flip();
    },

    // Update the color of the light.
    render: function () {
      $(this.el).toggleClass("on", this.model.get('lit'));
      return this;
    }
  });

  // The collection representing all of the lights.
  Lights = Backbone.Collection.extend({
    model: Light,

    getRow: function (index) {
      return this.filter(function (light) {
        if (light.get('row') === index.toString()) {
          return light;
        }
      });
    },

    /* puke code */
    setPuzzle: function (puzzle) {
      var lights, lightRow, lightCol;
      lights = this.filter(function (light) {
        lightRow = light.get('row');
        lightCol = parseInt(light.get('column'), 10);
        if (lightRow in puzzle && 
            puzzle[lightRow].indexOf(lightCol) > -1) {
          return light;
        }
      });

      _.invoke(lights, 'dispatch');
    }
  });

  // Create the collection instance.
  lights = new Lights();

  // view for lights collection 
  Board = Backbone.View.extend({
    id: 'game',

    initialize: function () {
      lights.on('add', this.add, this);
    },

    add: function (light) {
      var lightView = new LightView({
        model: light
      });
      $(this.el).append(lightView.render().el);
    },

    render: function () {
      return this;
    }
  });
  
  go = function () {
    var board,
      i, j;

    b = new Board();

    for (i = 0; i < SIZE; i ++) {
      for(j = 0; j < SIZE; j++) {
        lights.add(new Light({
          row: i.toString(10),
          column: j.toString(10)
        }));
      }
    }
    var puzzle = {
       1: [1, 2, 3, 4],
       2: [1, 2, 3, 4],
       3: [1, 2, 3, 4]
    };
    lights.setPuzzle(puzzle);
    $('header').after(b.el);
  };

  return {
    go: go
  };
});
