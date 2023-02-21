//Installato e richiesto il modulo di mongodb
let mongo = require("mongodb");
//Prelevo la parte del modulo per la gestione del client mongo
let mongoClient = mongo.MongoClient;
let  urlServerMongoDb = "mongodb://127.0.0.1:27017/";


let http = require("http");
let url = require("url");

let database = "DB_agenzia";
let op;

//DEFINISCO IL SERVER
let json;
let server = http.createServer(function(req, res){
    //Avverto il browser che ritorno un oggetto JSON
    res.setHeader('Content-Type', 'application/json');

    //Decodifico la richiesta ed eseguo la query interessata
    let scelta = (url.parse(req.url)).pathname;
    switch(scelta){
        case "/i1":
            insertMany(res, "proprietari",
            [
                {_id:1, nome:"Giovanni", cognome:"Caruso", dataNascita:new Date("1967-11-05"),
                residenza:["Via Roma", 3, "Fossano"] },
                {_id:2, nome:"Jacopo", cognome:"Orologio", dataNascita:new Date("1965-01-05"),
                residenza:["Via Giacomina", 10, "Fossano"]},
                {_id:3,nome:"Giorgio", cognome:"Lenovo", dataNascita:new Date("1950-07-15"),
                residenza:["Via Giuria", 55, "Salmour"] },
                {_id:4, nome:"Roberta", cognome:"Lorenzi", dataNascita:new Date("1980-09-10"),
                residenza:["Via Beata Paola", 120, "Genola"] },
                {_id:5,nome:"Valentina", cognome:"Sole", dataNascita:new Date("1990-05-16"),
                residenza:["Via Cuneo", 23, "Savigliano"] },
                {_id:6, nome:"Giorgia", cognome:"Esmeralda", dataNascita:new Date("1987-03-27"),
                residenza:["Via Torino", 201, "Fossano"] },
                {_id:7, nome:"Giancarlo", cognome:"Vallauri", dataNascita:new Date("1882-10-29"),
                residenza:["Via Torino", 1,"Fossano"] }
                ]);
            break;

        case "/i2":
            insertMany(res, "immobili",
            [
                { indirizzo:{via:"Via Cacciatori delle marmotte", civico:45, citta: "Fossano"},
                cap: 12045, proprietario:5, nLocali:3, tipo:"Casa", metriQuadri:200, prezzo:250000,
                caratteristiche: [{desc:"Giardino", disp:true}, {desc:"piscina", disp:false},
                {desc:"Terrazza", disp:false}, {desc:"Autorimessa", disp:false},
                {desc:"Ascensore", disp:false}], distCentro:1500},
                { indirizzo:{via:"Via della speranza", civico: 89, citta:"Savigliano"}, cap: 12038,
                proprietario:1, nLocali:2, tipo:"Appartamento", metriQuadri:60, prezzo:89000,
                caratteristiche: [{desc:"Giardino", disp:false}, {desc:"piscina", disp:false},
                {desc:"Terrazza", disp:true}, {desc:"Autorimessa", disp:true},
                {desc:"Ascensore", disp:false}], distCentro:500},
                { indirizzo:{via:"Via San Michele", civico:68, citta:"Fossano"}, cap: 12045,
                proprietario:7, nLocali:4, tipo:"Palazzo", metriQuadri:2500, prezzo:1500000,
                caratteristiche: [{desc:"Giardino", disp:false}, {desc:"piscina", disp:false},
                {desc:"Terrazza", disp:false}, {desc:"Autorimessa", disp:false},
                {desc:"Ascensore", disp:true}], distCentro:1000},
                { indirizzo:{via:"Via Ricrosio",civico:10,citta:"Fossano"}, cap: 12045,
                proprietario:5, nLocali:3, tipo:"Appartamento", metriQuadri:100, prezzo:100000,
                caratteristiche: [{desc:"Giardino", disp:true}, {desc:"piscina", disp:false},
                {desc:"Terrazza", disp:false}, {desc:"Autorimessa", disp:false},
                {desc:"Ascensore", disp:false}], distCentro:100},
                { indirizzo:{via:"Via Bra", civico:120, citta:"Fossano"}, cap: 12045,
                proprietario:3, nLocali:5, tipo:"Casa", metriQuadri:250, prezzo:500000,
                caratteristiche: [{desc:"Giardino", disp:true}, {desc:"piscina", disp:true},
                {desc:"Terrazza", disp:true}, {desc:"Autorimessa", disp:true},
                {desc:"Ascensore", disp:false}], distCentro:3000},
                { indirizzo:{via:"Via Savigliano", civico:6, citta:"Genola"}, cap: 12041,
                proprietario:2, nLocali:1, tipo:"Appartamento", metriQuadri:50, prezzo:35000,
                caratteristiche: [{desc:"Giardino", disp:false}, {desc:"piscina", disp:false},
                {desc:"Terrazza", disp:false}, {desc:"Autorimessa", disp:false},
                {desc:"Ascensore", disp:false}], distCentro:1000}
                ]);
            break;

        case "/q3":
            let dataMeno50anni = new Date();
            dataMeno50anni.setFullYear(dataMeno50anni.getFullYear()-50);
            //Ricavare le persone che hanno meno di 50 anni e vivono in una città diversa da Fossano
            find(res, "proprietari", {dataNascita:{$gte:dataMeno50anni}, residenza:{$ne:"Fossano"}}, {});
            break;

        default:
            json = {cod:-1, desc:"Nessuna query trovata con quel nome"};
            res.end(JSON.stringify(json));
    }
});

server.listen(8888, "127.0.0.1");
console.log("Il server è in ascolto sulla porta 8888");

function creaConnessione(nomeDb, response, callback){
    console.log(mongoClient);
    let promise = mongoClient.connect(urlServerMongoDb);
    promise.then(function(connessione){
        callback(connessione, connessione.db(nomeDb))
    });
    promise.catch(function(err){
        json = {cod:-1, desc:"Errore nella connessione"};
        response.end(JSON.stringify(json));
    });
}

function find(res, col, obj, select){
    console.log(obj);
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).find(obj).project(select).toArray();
        promise.then(function(ris){
            //console.log(ris);
            obj = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(obj));
            conn.close();
        });
        promise.catch(function(error){
            obj = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function find2(res, col, obj, select, callback){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).find(obj).project(select).toArray();
        promise.then(function(ris){
            conn.close();
            callback(ris);
        });
        promise.catch(function(error){
            obj = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function limit(res, col, obj, select, n){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).find(obj).project(select).limit(n).toArray();
        promise.then(function(ris){
            //console.log(ris);
            obj = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(obj));
            conn.close();
        });
        promise.catch(function(error){
            obj = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function sort(res, col, obj, select, orderby){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).find(obj).project(select).sort(orderby).toArray();
        promise.then(function(ris){
            //console.log(ris);
            obj = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(obj));
            conn.close();
        });
        promise.catch(function(error){
            obj = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function cont(res, col, query){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).countDocuments(query);
        promise.then(function(ris){
            //console.log(ris);
            json = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(error){
            json = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

function cont2(res, col, query){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).count(query);
        promise.then(function(ris){
            //console.log(ris);
            json = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(error){
            json = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

function insertOne(res, col, obj){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).insertOne(obj);
        promise.then(function(ris){
            json = { cod:1, desc:"Insert in esecuzione", ris };
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(err){
            obj = { cod:-2, desc:"Errore nell'inserimento"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function insertMany(res, col, array){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).insertMany(array);
        promise.then(function(ris){
            json = { cod:1, desc:"Insert in esecuzione", ris };
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(err){
            json = { cod:-2, desc:"Errore nell'inserimento"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

function update(res, col, array, modifica) {
    creaConnessione(database, res, function (conn, db) {
        let promise = db.collection(col).updateMany(array, modifica);
        promise.then(function (ris) {
            json = {cod: 1, desc: "Update in esecuzione", ris};
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function (err) {
            json = {cod: -2, desc: "Errore nella modifica"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

function remove(res, col, where) {
    creaConnessione(database, res, function (conn, db) {
        let promise = db.collection(col).deleteMany(where);
        promise.then(function (ris) {
            json = {cod: 1, desc: "Insert in esecuzione", ris};
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function (err) {
            json = {cod: -2, desc: "Errore nella cancellazione"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

// Aggregate --> aggregazione di funzioni di ricerca
// Opzioni --> array di oggetti dove ogni oggetto è un filtro che vogliamo applicare alla collezione
function aggregate (res, col, opzioni){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).aggregate(opzioni).toArray();
        promise.then(function(ris){
            json = { cod:0, desc:"Dati trovati con successo", ris};
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(error){
            json = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(json));
            conn.close();
        });
    });
}

function aggregate2(res, col, opzioni, callback){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).aggregate(opzioni).toArray();
        promise.then(function(ris){
            conn.close();
            callback(ris);
        });

        promise.catch(function(error){
            obj = { cod:-2, desc:"Errore nella ricerca"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function updateOne(res, col, where, modifica){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).updateOne(where, modifica);
        promise.then(function(ris){
            json = { cod:1, desc:"Update effettuata", ris };
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(err){
            obj = { cod:-2, desc:"Errore nell'update"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}

function replaceOne(res, col, where, modifica){
    creaConnessione(database, res, function(conn, db){
        let promise = db.collection(col).replaceOne(where, modifica);
        promise.then(function(ris){
            json = { cod:1, desc:"Update effettuata", ris };
            res.end(JSON.stringify(json));
            conn.close();
        });
        promise.catch(function(err){
            obj = { cod:-2, desc:"Errore nell'update"}
            res.end(JSON.stringify(obj));
            conn.close();
        });
    });
}