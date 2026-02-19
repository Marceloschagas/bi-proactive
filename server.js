// Cria a pasta data se ela não existir
const fs = require('fs');
if (!fs.existsSync('./data')){
    fs.mkdirSync('./data');
}

// O banco agora vive dentro da pasta blindada pelo volume
const db = new sqlite3.Database('./data/database.sqlite');