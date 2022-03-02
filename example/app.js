
const Achene = require('../achene.js');

Achene.init({
   port: 8765,
   address: '0.0.0.0',
   routes: [
     { method: 'GET', path: '/meh', fn: meh } 
   ]
});

function meh(req) {
  return new Promise((resolve, reject) => {
    console.log(Achene.parsed);
    resolve({ message : "MEH !", req: req.url } );
  });
}

