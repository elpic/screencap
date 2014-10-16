var casper = require('casper').create({
  waitTimeout: 60000,       // If angular does not load all the content after 60s we should
                            // close the page.
  verbose:  true,
  logLevel: 'error'
});

function getWithDefault(option, default_value) {
  if (typeof option !== 'undefined') {
    return option;
  } else {
    return default_value;
  }
}

var url          = casper.cli.options.url;
var output       = casper.cli.options.output;
var page_width   = getWithDefault(casper.cli.options.page_width,  1024);
var page_height  = getWithDefault(casper.cli.options.page_height, 550);
var hidden_class = getWithDefault(casper.cli.options.hidden_class, '.no-printable');

if(!casper.cli.has('url') || !casper.cli.has('output')) {
  var message =
    'Usage: raster.js \n\n' +
    'raster.js [OPTIONS]\n\n' +
    'OPTIONS\n' +
    '=======\n\n' +
    'url         - A url to fetch the content (required).\n' +
    'output      - File in witch the content will be stored (required).\n' +
    'verbose     - By default is true, this will output content to the\n' +
    '              terminal.' +
    'page_width  - The width of the page.\n' +
    'page_height - The height of the page.\n' +
    'hidden_class - This is a selector, all the elements that match\n' +
    '               with the selector will be hide.';

  casper.log(message, 'error');
  capser.exit();

} else {
  casper.start(url);

  casper.viewport(page_width, page_height).then(function(){
    casper.waitForSelector('body.angular-completed', function() {
      casper.evaluate(function(hidden_selector_class){
        $(hidden_selector_class).hide();
      }, hidden_class);

      this.capture(output, this.getElementBounds('body'));
    });
  });

  casper.run();
}