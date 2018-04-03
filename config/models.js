var TAG = _TAG('config.models');

var path = require('path');
var Waterline = require('waterline');

module.exports = function (app, next){
  // Create new waterline ORM
  var waterline = app.waterline = new Waterline();

  // Load All controllers
  var modelsDir = path.join(__dirname, '/../models');
  var models = app.helpers.loader.load(modelsDir);

  // Convert to model object and load into waterline
  var collections = {};
  for(var k in models){
    collections[k] = Waterline.Collection.extend(models[k]);
  }
  
  var defaults;
  if(process.env.NODE_ENV === 'production') {
      defaults = {
        migrate:  'safe'
      }
  }

  // Config used in this waterline instance
  var config = {
    adapters: {
      'default': require(app.config.adapter)
    },

    connections: {
      default: _.defaults({adapter: 'default'}, app.config.connection),
    },

    collections,
    defaults: defaults
  };
   
  // Initialize waterline app
  app.waterline.initialize(config, (err, ontology) => {
    if(err)
      return next(err);
    
   

    // Expose collections/models to application (Use File name as ID)
    app.models = {};
    for(var id in models){
      app.models[id] = ontology.collections[models[id].identity];
    }

    console.log(TAG, 'Models:', chalk.yellow(_.keys(app.models).join(',')));

    next()
  })
}
