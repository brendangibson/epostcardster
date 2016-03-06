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

pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
client.query('SELECT payload FROM postcard WHERE id = $1', [params.id], function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0]);
			var output = querystring.parse(result.rows[0].payload);
			console.log(output);
			
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(params.callback+'(');
			res.write(JSON.stringify(output));
			res.write(');');
			res.end();
    //output: 1
  });
});

	},

	handleSavePostcard = function (req, res) {
	
		var params = querystring.parse(url.parse(req.url).query),
		
			output =  querystring.stringify(params),
			id;	
		
		console.log("output: " + output);
		console.log("save params: " + params);
		console.log("writing to: " + fileName);	

	   
	

pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
client.query('INSERT INTO postcard (payload) VALUES ($1) RETURNING id', [output], function(err, result) {

      // handle an error from the query
      if(err) {
	console.log(err);
	return;
	}

console.log('insert result: ', result);

id = result.rows[0].id;
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(params.callback + '(');
		res.write('{"id":' + id + '}');
		res.write(');');
		res.end();
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

