//URL to zipped GTFS data http://www.bart.gov/dev/schedules/google_transit.zip


//zip stuff is from http://stackoverflow.com/questions/14107470/nodejs-download-and-unzip-file-from-url-error-no-end-header-found
var http = require('http'),
    fs = require('fs'),
    request = require('request'),
    //AdmZip has some issues. unzip is a lot more tolerant. 
    //AdmZip = require('adm-zip'),
    unzip = require('unzip-wrapper'),
    out = fs.createWriteStream('google_transit.zip'),
    replace = require("replace"),
    walk = require("walk");	
    config = require('./config.json'),
    fileUrl = require('file-url'),
	//options for walk to process synchronously
 	options = {
	    listeners: {
	      names: function (root, nodeNamesArray) {
	        nodeNamesArray.sort(function (a, b) {
	          if (a > b) return 1;
	          if (a < b) return -1;
	          return 0;
	        });
	      }
	    , directories: function (root, dirStatsArray, next) {
	        next();
	      }
	      // runs on every file walked over
	    , file: function (root, fileStats, next) {
	    	inProcess = getUploadsInProcess();

	    	while (inProcess <3) {
	   			cartoDBimport(fileStats.name,next());
	   			sleep(10);
	   			inProcess = getUploadsInProcess();
	   			console.log(inProcess, 'imports running');
	   		}

	      }
	    , errors: function (root, nodeStatsArray, next) {
	        next();
	      }
	    }
	  };

var validFiles = [
	"agency.txt",
	"calendar.txt",
	"calendar_dates.txt",
	"fare_attributes.txt",
	"fare_rules.txt",
	"feed_info.txt",
	"frequencies.txt",
	"routes.txt",
	"stop_times.txt",
	"stops.txt",
	"transfers.txt",
	"trips.txt"
]

    // Downloading NSE Bhavcopy
var req = request(
    {
        method: 'GET',
        uri: config.gtfsUrl
    }
);

console.log('Starting DL of', config.gtfsUrl);
req.pipe(out);
req.on('end', function() {
    unzip("google_transit.zip", { target : 'unzip/'}),

    //todo add some logic to handlr errors
    //processUnzipped();
    renameHeaders();
});

function renameHeaders() {
	replace({
	    regex: "stop_lat",
	    replacement: "lat",
	    paths: ['unzip/stops.txt'],
	    recursive: true,
	    silent: true
	});
	replace({
	    regex: "stop_lon",
	    replacement: "lon",
	    paths: ['unzip/stops.txt'],
	    recursive: true,
	    silent: true
	});

	processUnzipped();

};

function processUnzipped() {
	//iterate over our unzipped files and push each to cartoDB

	var walker  = walk.walkSync('./unzip', options);

};

function getUploadsInProcess() {
	var url = 'https://' + config.username + '.cartodb.com/api/v1/imports/?api_key=' + config.apikey;

	var req = request.get(url, function (err,resp,body){
		if (err) {
		     console.log('Error!');
		 } else {
		     imports = JSON.parse(body);
		     console.log(imports);
		     return imports.imports.length;
		   }
	})
	
}

function cartoDBimport(filename,callback) {
	var url = 'https://' + config.username + '.cartodb.com/api/v1/imports/?api_key=' + config.apikey;
	 
	var req = request.post(url, function (err, resp, body) {
	   if (err) {
	     console.log('Error!');
	   } else {
	     //console.log('Response: ' + body);
	     callback;
	   }
	 });

	 var form = req.form();
	 form.append('file', fs.createReadStream('unzip/' + filename));
}

