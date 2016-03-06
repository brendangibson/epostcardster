console.log('Running epostcardster');

var http = require('http'),
	url = require("url"),
	querystring = require("querystring"),
	fs = require('fs'),
	pg = require('pg');
	SAVE_DIR = "",
	PORT = 80,

	handleRetrievePostcard = function (req,res) {
		var params = querystring.parse(url.parse(req.url).query);
		console.log(params.id);
		fs.readFile(SAVE_DIR + params.id, 'utf8', function (err, data) {
			if (err) { 
				console.log("Error reading " + SAVE_DIR + params.id + " : ",err);
			}
			var output = querystring.parse(data);
			console.log(output);
			
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(params.callback+'(');
			res.write(JSON.stringify(output));
			res.write(');');
			res.end();
		
		});

	},

	handleSavePostcard = function (req, res) {
	
		var params = querystring.parse(url.parse(req.url).query),
		
			output =  querystring.stringify(params),
			id = parseInt(Math.random() * 100000000,10),	
			fileName = SAVE_DIR + id;
		
		console.log("output: " + output);
		console.log("save params: " + params);
		console.log("writing to: " + fileName);	

		fs.writeFile(fileName, output, function(err) {
			if(err) {
				console.log(err);
			} else {
			        console.log("The file was saved! "+id.toString());
			}
		}); 
	   
	
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(params.callback + '(');
		res.write('{"id":' + id + '}');
		res.write(');');
		res.end();

pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
client.query('INSERT INTO postcard (payload) VALUES ($1)', [output], function(err, result) {

      // handle an error from the query
      if(err) {
	console.log(err);
	return;
	}
    });
});
		  
	},

handleRequest = function (req, res) {

	console.log('request being handled');

	try {
		var pathname = url.parse(req.url).pathname;
	 
		if (pathname === '/retrieve') {
			handleRetrievePostcard(req,res);
		}
		else if (pathname === '/save') {
			handleSavePostcard(req,res);
		} else {
		    console.log("Unknown request");
		    res.writeHead(500, {"Content-Type": "text/plain"});
		    res.write("Unknown request");
		    res.end();
		}
	} catch (err) {
		console.log("unanticipated error: " + err);
	}
};


pg.defaults.ssl = true;

http.createServer(handleRequest).listen(process.env.PORT || 8888);

console.log('Server running');

