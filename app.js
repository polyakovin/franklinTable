var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.json();

var app = express();

app.use(express.static('dist'));

app.post('/save', parseUrlencoded, function(request, response) {
  // console.log();
  fs.writeFile("src/assets/tiks.json", JSON.stringify(request.body), () => {
    response.end();
  });
});

app.listen(8080, function(){
  console.log('Сервер доступен по адресу http://localhost:8080');
});