var dburl = "localhost/radbool";
var collections = ["bool_base_widget","boolAppObj","counters"];
var db = require("mongojs").connect(dburl, collections);

app.post('/boolCrudInsert', function(req, res){
    db.boolAppObj.insert({objType:"container"},{_id:0,isn:1,objType:1,objName:1},function(err, data){
        if( err || !data) console.log("Could Not Insert!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

app.post('/boolCrudDelete', function(req, res){
    db.boolAppObj.remove({objType:"container"},{_id:0,isn:1,objType:1,objName:1},function(err, data){
        if( err || !data) console.log("Could Not Delete!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

app.post('/boolCrudUpdate', function(req, res){
    db.boolAppObj.save({objType:"container"},{_id:0,isn:1,objType:1,objName:1},function(err, data){
        if( err || !data) console.log("Could Not Update!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

app.post('/boolCrudRead', function(req, res){
	var condition = req.body.cond;
	var colName   = req.body.colName;
    db.find({objType:"container"},{_id:0,isn:1,objType:1,objName:1},function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});