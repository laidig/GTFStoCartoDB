//URL to zipped GTFS data http://www.bart.gov/dev/schedules/google_transit.zip


//zip stuff is from http://stackoverflow.com/questions/14107470/nodejs-download-and-unzip-file-from-url-error-no-end-header-found
var http = require('http'),
    fs = require('fs'),
    request = require('request'),
    AdmZip = require('adm-zip');
    out = fs.createWriteStream('google_transit.zip'),
    replace = require("replace"),
    walk = require("walk");	
    config = require('./config.json');

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

req.pipe(out);
req.on('end', function() {
    var zip = new AdmZip("google_transit.zip"),
    zipEntries = zip.getEntries();
    zip.extractAllTo("unzip/", true);

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

	var walker  = walk.walk('./unzip', { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    // Add this file to the list of files
	    console.log(stat.name);
	    cartoDBimport(stat.name,next());
	    // next();
	});
};

function cartoDBimport(filename,callback) {
	var url = 'https://' + config.username + '.cartodb.com/api/v1/imports/?api_key=' + config.apikey;


console.log(url);
	 var req = request.post(url, function (err, resp, body) {
	   if (err) {
	     console.log('Error!');
	   } else {
	     console.log('Response: ' + body);
	     callback;
	   }
	 });

	 var form = req.form();
	 form.append('file', fs.createReadStream('unzip/' + filename));
}

