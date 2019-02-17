var csv = require("fast-csv");
var fs = require('fs');
var path = require('path')

var stream = fs.createReadStream(path.join(__dirname, '../../files', 'data.csv'))

module.exports = function(app) {
/*
    var csvStream = csv()
    .on("data", function(data){
         console.log(data);
    })
    .on("end", function(){
         console.log("done");
    });
 
    stream.pipe(csvStream);

*/
};