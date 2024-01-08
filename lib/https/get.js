const https = require('node:https');

module.exports = async (options) => {
    return new Promise(resolve => {
        let data = [];
  
        const req = https.get(options, res => {
            res.on('data', chunk => { data.push(chunk) });
            res.on('end', () => {
                resolve(Buffer.concat(data).toString());
            });
            res.on('error', (e) => {
                console.log(e);
                resolve(null)
            });
        });
  
        req.end();
    });
}