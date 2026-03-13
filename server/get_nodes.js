const fs = require('fs');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
dns.resolveSrv('_mongodb._tcp.cluster0.pzbvenu.mongodb.net', (err, addresses) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    fs.writeFileSync('nodes.txt', addresses.map(a => a.name).join(','));
});
