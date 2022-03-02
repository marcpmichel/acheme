// vim: ts=4 sw=4
const URL = require('url');
const fs = require('fs');
const http = require('http');

const Achene = {
	routes: [],

	init(opts) {
		Achene.server = http.createServer(Achene.handle);
		Achene.server.listen(opts.port, opts.address);
		this.routes = opts.routes || [];
	},

	handle(req, res) {
		Achene.parsed = URL.parse(req.url);

		if(Achene.handle_actions(req, res)) return;
		if(Achene.handle_static(req, res)) return;

		Achene.reply_error(res, 404, "404 :(");
	},

	handle_static(req, res) {
		var parsed = Achene.parsed;
		if(parsed.pathname == '/') {
			console.log("Serving index");
			Achene.reply_static(req, res, './assets/index.html', 'text/plain');
			return true;
		}

		if(String(parsed.pathname.match(/^\/assets\/.*/))) {
			// console.log("Serving asset : " + parsed.pathname);
			Achene.reply_static(req, res, './'+parsed.pathname );
			return true;
		}

		return false;
	},

	handle_actions(req, res) {
		var parsed = Achene.parsed;
		const route = Achene.routes.find(r => r.path == parsed.pathname && r.method == req.method);
		if(!route) return false;

		// console.log("found "+ route.method + " " + route.path);
		try {
			if(typeof route.fn == 'function') {
				Achene.reply_json(req, res, route.fn);
			}
			else {
				Achene.reply_error(res, 500, `no function for action ${route.path}`);
			}
		}
		catch(e) {
			Achene.reply_error(res, 500, e.message);
		}
		return true;
	},

	reply_json(req, res, promise) {
			var prom = promise(req);
			prom.then((data) => {
				res.writeHead(200, { 'ContentType' : 'application/json' });
				res.end(JSON.stringify(data));
			});
			prom.catch((err, status) => {
				const errcode = status || 500;
				res.writeHead(errcode , { 'ContentType' : 'application/json'});
				res.end(JSON.stringify(err));
			});
	},

	reply_static(req, res, filepath, mime) {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				res.writeHead(404, { 'ContentType': 'text/plain' });
				res.end(JSON.stringify('404 :('));
			}
			else {
				res.writeHead(200, { 'ContentType': mime || 'text/plain' });
				res.end(data);
			}
		});
	},

	reply_error(res, status, message) {
		res.writeHead(status, { 'contentType': 'text/plain' });
		res.end(message || 'error' );
	},

	parse_data(req, callback) {
		let body = '';
		req.on('data', (chunk) => { body += chunk.toString(); });
		req.on('end', () => {
			callback(body);
		});
	}
};

module.exports = Achene;


