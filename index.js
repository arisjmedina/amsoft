const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const app = express();


var port = process.env.port || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/ajmscripts',express.static(__dirname + '/src/'));


app.engine('.hbs',exphbs({
    defaultLayout: 'layout',
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

app.post('/api/querydata',function(req,res){

    var data = req.body;
    console.log(data);

    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    const tablename = data.name;

    const url = 'mongodb://localhost:27017';
    const dbName = 'seacrest';


//  db.Employee.find({'fields.0.value':'Aris','fields.1.value':'Midina'}).pretty();
//  db.Family.find({"fields.0.value" : {$ne: ""}})
    

    var queryVal = {};
    var emptyVal = {$ne: ""};// dont include value
    var missing = 0;

    for(var i=0; i < data.fields.length; i++)
    {
        if(data.fields[i].value.length == 0)
            missing++;
    }
    
console.log(missing);

    if(missing == data.fields.length)
    {
        for(var i=0; i < data.fields.length; i++)
        {
            //if(data.fields[i].value.length > 0){
                queryVal["fields."+ i + ".value"] = emptyVal;
           // }
        }

    }else {
       
        for(var i=0; i < data.fields.length; i++)
        {

            if(data.fields[i].value.length > 0){
                //var val =  {'$regex': data.fields[i].value , '$options': 'i'};
                queryVal["fields."+ i + ".value"] = {'$regex': data.fields[i].value , '$options': 'i'};
            }
            
        }

    }

    console.log(queryVal);


    (async function() {
    let client;

    try {
        client = await MongoClient.connect(url,{useNewUrlParser:true});
        console.log("Connected correctly to server");

        const db = client.db(dbName);

        // Get the collection
        const col = db.collection(tablename);
        const docs = await col.find(queryVal).sort({'fields.0.value': 1}).toArray();
       
        res.json({data: docs});
       
    } catch (err) {
        res.send(err.message);
        console.log(err.stack);
    }

    
    client.close();
    })();

    //res.json({data: data});
})


// insert <collection name> <data>
app.post('/api/insertdata',function(req,res){
    
        var data = req.body;

        const MongoClient = require('mongodb').MongoClient;
        const assert = require('assert');

        const url = 'mongodb://localhost:27017';
        const dbName = 'seacrest';

        (async function() {
        const client = new MongoClient(url,{useNewUrlParser:true});

        try {
            await client.connect();
            console.log("Connected correctly to server");

            const db = client.db(dbName);
            
            console.log("inserting attempted..");
            let r = await db.collection(data.name).insertOne(data);
            //assert.equal(1, r.insertedCount);

            res.json({result: "OK", error: ""})
            console.log("Operation Added");


        } catch (err) {
            console.log(err.stack);
            res.json({result: "FAILED", error: err.stack});
        }

        // Close connection
        client.close();
        console.log("connection is closed..")
        })();

})


app.post('/api/tables/',function(req,res){

    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');

    const url = 'mongodb://localhost:27017';
    const dbName = 'seacrest';

    (async function() {
    const client = new MongoClient(url,{useNewUrlParser:true});

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        
        var cursor = await db.listCollections();

        var retVal = [];
        while(await cursor.hasNext()) {
            const doc = await cursor.next();
                console.dir(doc.name);
                retVal.push(doc.name);
        }

        res.json({table: retVal});

    } catch (err) {
        console.log(err.stack);
        res.send(err.stack);
    }
    
    client.close();
    console.log("connection is closed..")
    })();
})


app.get('/api/details', function(req,res){
    
    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    const tablename = req.query.tablename;

    const url = 'mongodb://localhost:27017';
    const dbName = 'seacrest';

    (async function() {
    let client;

    try {
        client = await MongoClient.connect(url,{useNewUrlParser:true});
        console.log("Connected correctly to server");

        const db = client.db(dbName);

        // Get the collection
        const col = db.collection(tablename);
        const docs = await col.find({name:tablename}).limit(1).toArray();

        res.json({data: docs});
       
    } catch (err) {
        res.send(err.message);
        console.log(err.stack);
    }

    
    client.close();
    })();

})

app.post('/api/add/', function(req,res)
{

        var data = req.body;

        const MongoClient = require('mongodb').MongoClient;
        const assert = require('assert');

        const url = 'mongodb://localhost:27017';
        const dbName = 'seacrest';

        (async function() {
        const client = new MongoClient(url,{useNewUrlParser:true});

        try {
            await client.connect();
            console.log("Connected correctly to server");

            const db = client.db(dbName);
            const col = db.collection(data.name);
            const cursor = col.find({name: data.name}).limit(1);
            
            // Iterate over the cursor
           
            while(await cursor.hasNext()) {
            const doc = await cursor.next();
                console.dir(doc);
                client.close();
                console.log("connection is closed");
                return res.json({result:"FAILED",error: "Already Exist"});
            }

            console.log("inserting attempted..")
            // Insert a single document
            let r = await db.collection(data.name).insertOne(data);
            assert.equal(1, r.insertedCount);
            res.json({result: "OK", error: ""})
            console.log("Operation Added");


        } catch (err) {
            console.log(err.stack);
            res.json({result: "FAILED", error: err.stack});
        }

        // Close connection
        client.close();
        console.log("connection is closed..")
        })();
  

});


//home 
app.get('/home',function(req,res){
    res.render('home', {
        showTitle: true,
        // Override `foo` helper only for this rendering.
        helpers: {
            foo: function () { return 'testing...'; }
        }
    });
})

app.listen(port, function(err){
    if(err)
        throw err;
    console.log('running on port ' + port);
})