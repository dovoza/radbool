var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var Q = require('q');

var routes = require('./routes/index');
var users = require('./routes/users');

//Custom Libs
var boolStruct = require('./routes/boolstruct');

//DB Connection
var dburl = "localhost/radbool";
var collections = ["bool_base_widget","boolAppObj","counters", "workspace", "wsuser", "boolApp","boolCtrl","boolAppPanel", "boolEvent", "boolAction"];
var db = require("mongojs").connect(dburl, collections);
var ObjectId = db.ObjectId;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/radbool', function(req, res) {
    res.render('radbool');
});

//Application Render
app.post('/renderApp', function(req, res){
    appIsn = req.body.appIsn;
    //console.log(appIsn);
    var myTree = new boolStruct();
    myTree.init(appIsn);
    myTree.render();
    setTimeout(function(){
        //console.log(myTree.treeData);
        //console.log(myTree.depth());
        //console.log(myTree.printTree());
        res.send("Rendered Application...");
    },300);
    //myTree.render();
    /*myTree.pushNode(2,1,1);
    myTree.pushNode(3,2,1);
    myTree.pushNode(4,1,2);
    myTree.pushNode(5,2,2);
    console.log(myTree.printTree());*/
});


//Panel Save action
app.post('/panelSave', function(req, res) {
    p = req.body;
    if (!p.isModalPanel) {
        panelcont = {"appIsn" : p.appIsn, "parentIsn" : p.panelParId, baseWigName:"panel", "baseWigCode" : "<div class='bool-container panel'></div>", "objType" : "container", "objName" : p.panelId, "objSeq" : p.panelSeq, "objWidth" : p.panelInstWidth, "objOffset" : p.panelInstOffset, "objRow" : p.panelRow, objOps:{panelType:p.panelType}};
        db.boolAppObj.insert(panelcont, function (err, saved) {
        if(err) res.send("Could not save whole panel!");
        else{
            db.boolAppObj.findOne({'objName':p.panelId, appIsn:p.appIsn},function(err, data){
                if( err || !data) console.log("App not found!");
                else {
                    panelIsn = String(data._id);
                    panelheader = {"appIsn" : p.appIsn, "parentIsn" : panelIsn, baseWigName:"panel-header", "baseWigCode" : "<div class='panel-heading'><div class='bool-container panel-title'></div></div>", "objType" : "container", "objName" : p.panelId+"-header", "objSeq" : 1, "objWidth" : p.panelInstWidth, "objOffset" : p.panelInstOffset, "objRow" : p.panelRow, objOps:{panelTitle:p.panelTitle, panelTitleSize:p.panelTitleSize}};
                    panelbody = {"appIsn" : p.appIsn, "parentIsn" : panelIsn, baseWigName:"panel-body", "baseWigCode" : "<div class='bool-container panel-body'></div>", "objType" : "container", "objName" : p.panelId+"-body", "objSeq" : 2, "objWidth" : p.panelInstWidth, "objOffset" : p.panelInstOffset, "objRow" : p.panelRow, objOps:{panelId:p.panelId}};
                    panelfooter = {"appIsn" : p.appIsn, "parentIsn" : panelIsn, baseWigName:"panel-footer", "baseWigCode" : "<div class='bool-container panel-footer'></div>", "objType" : "container", "objName" : p.panelId+"-footer", "objSeq" : 3, "objWidth" : p.panelInstWidth, "objOffset" : p.panelInstOffset, "objRow" : p.panelRow, objOps:{panelId:p.panelId}};
                    //Insert panel parts to database
                    if (p.hasHeaderPanel) {db.boolAppObj.insert(panelheader)}
                    db.boolAppObj.insert(panelbody);
                    if (p.hasFooterPanel) {db.boolAppObj.insert(panelfooter)}
                    //Save whole configuration to panels collection
                    //db.boolAppPanel.insert(p);
                };
            });
            res.send("panel saved Successfully!")
        }
    });

    };
});

app.post('/tabSave',function(req, res){
    t = req.body;

    saveTabCont = function(){
        var deferred = Q.defer();
        tabCont = {"appIsn" : t.appIsn, "parentIsn" : t.parentIsn, baseWigName:"tab", "baseWigCode" : "<div class='tab-container bool-container'></div>", "objType" : "container", "objName" : t.objName, "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{tabStacking:t.objOps.tabStacking, tabType:t.objOps.tabType}};
        
        db.boolAppObj.insert(tabCont, function (err, resp) {
            db.boolAppObj.findOne({'objName':t.objName, appIsn:t.appIsn},function(err2, data){
                if (err2 || !data) {
                    //console.log(data, "reject");
                    deferred.reject(data);
                }else {
                    //console.log(data);
                    deferred.resolve(data);
                }
            });
            
        });
        return deferred.promise;
        
    }

    saveTabNav = function(parData){
        var deferred = Q.defer();
        tabNav = {"appIsn" : t.appIsn, "parentIsn" : parData._id, baseWigName:"tab-navigator", "baseWigCode" : "<ul class='nav bool-container'></ul>", "objType" : "container", "objName" : t.objName+"-navigator", "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{tabStacking:t.objOps.tabStacking, tabType:t.objOps.tabType}};

        db.boolAppObj.insert(tabNav, function (err, resp) {
            db.boolAppObj.findOne({'objName':t.objName+"-navigator", appIsn:t.appIsn},function(err2, data){
                if (err2 || !data) {
                    console.log(data, "reject");
                    deferred.reject(data);
                }else{
                    console.log(data);
                    deferred.resolve(data);
                }
            });
            
        })

        return deferred.promise;
    }

    saveTabContent = function(parData){
        var deferred = Q.defer();
        tabContent = {"appIsn" : t.appIsn, "parentIsn" : parData._id, baseWigName:"tab-content", "baseWigCode" : "<div class='tab-content bool-container'></div>", "objType" : "container", "objName" : t.objName+"-content", "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{tabStacking:t.objOps.tabStacking, tabType:t.objOps.tabType}};

        db.boolAppObj.insert(tabNav, function (err, resp) {
            db.boolAppObj.findOne({'objName':t.objName+"-content", appIsn:t.appIsn},function(err2, data){
                if (err2 || !data) {
                    console.log(data);
                    deferred.reject(data);
                }else{
                    console.log(data, "resolve");
                    deferred.resolve(data);
                }
            });
            
        });
        return deferred.promise;
    }

    saveNavMenu = function(navMenuObj, mynav){
        var deferred = Q.defer();

        db.boolAppObj.insert(navMenuObj, function (err, resp) {
            db.boolAppObj.findOne({'objName':mynav.navid, appIsn:t.appIsn},function(err2, data){
                if (err2 || !data) {
                    console.log(data);
                    deferred.reject(data);
                }else{
                    console.log(data, "resolve");
                    deferred.resolve(data);
                }
            });
            
        });
        return deferred.promise;
    }

    saveTabCont()
    .then(function(data){
        //console.log(data);
        saveTabNav(data).then(function(resp){
            navigatorId = resp._id;
            navs = t.objOps.tabNavLinks;
            navs.forEach(function(nav){
                if (nav.navtype == "normal") {
                  navObj = {"appIsn" : t.appIsn, "parentIsn" : navigatorId, baseWigName:"tab-link", "baseWigCode" : "<li><a href='#'' data-toggle='tab'></a></li>", "objType" : "nav-link", "objName" : nav.navid, "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{navid:nav.navid, navtitle:nav.navtitle, navtype:nav.navtype}};
                  db.boolAppObj.insert(navObj);
                }else if (nav.navtype == "menu") {
                  navObj = {"appIsn" : t.appIsn, "parentIsn" : navigatorId, baseWigName:"tab-link-menu", "baseWigCode" : "<li class='dropdown'><a class='dropdown-toggle' data-toggle='dropdown' href='#'><span class='caret'></span></a><ul class='dropdown-menu bool-container'></ul></li>", "objType" : "container", "objName" : nav.navid, "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{navid:nav.navid, navtitle:nav.navtitle, navtype:nav.navtype}};
                  saveNavMenu(navObj, nav).then(function(data){
                    menuId = data._id;
                    menuObjName = navObj.objName;
                    menus = t.objOps.tabMenuLinks;
                    menus.forEach(function(menu){
                      if (menu.parentnavid == menuObjName) {
                        navObj = {"appIsn" : t.appIsn, "parentIsn" : menuId, baseWigName:"tab-link", "baseWigCode" : "<li><a href='#'' data-toggle='tab'></a></li>", "objType" : "nav-link", "objName" : menu.menunavid, "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{navid:menu.menunavid, navtitle:menu.menunavtitle, navparent:menu.parentnavid}};
                        db.boolAppObj.insert(navObj);
                      }
                    });
                  })
                };
            });
        });

        saveTabContent(data).then(function(resp){
            tabContentId = resp._id;
            navs2 = t.objOps.tabNavLinks;
            menus2 = t.objOps.tabMenuLinks;

            navs2.forEach(function(nav2){
                navObj2 = {"appIsn" : t.appIsn, "parentIsn" : tabContentId, baseWigName:"tab-pane", "baseWigCode" : "<div class='tab-pane fade bool-container'></div>", "objType" : "container", "objName" : nav2.navid+"-Pane", "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{navid:nav2.navid, navtitle:nav2.navtitle, navtype:nav2.navtype}};
                db.boolAppObj.insert(navObj2);
            });

            menus2.forEach(function(menu2){
                navObj3 = {"appIsn" : t.appIsn, "parentIsn" : tabContentId, baseWigName:"tab-pane", "baseWigCode" : "<div class='tab-pane fade bool-container'></div>", "objType" : "container", "objName" : menu2.menunavid+"-Pane", "objSeq" : t.objSeq, "objWidth" : t.objWidth, "objOffset" : t.objOffset, "objRow" : t.objRow, objOps:{navid:menu2.menunavid, navtitle:menu2.menunavtitle, navparent:menu2.parentnavid}};
                db.boolAppObj.insert(navObj3);
            })
        });
    })

    //console.log(t);
    res.send("tab saved Successfully!");
});

app.post('/formSave',function(req, res){
    f = req.body;
    //console.log(f);
    db.boolAppObj.insert(f);
    res.send("form saved Successfully!");
});

app.post('/textSave',function(req, res){
    textInput = req.body;
    //console.log(textInput);
    db.boolAppObj.insert(textInput);
    res.send("Input saved Successfully!");
});

//Get All containers
app.post('/getCont', function(req, res){
    query = req.body;
    db.boolAppObj.find(query,{_id:1,isn:1,objType:1,objName:1},function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            //console.log(data);
            res.send(data);
        };
    });
});

//WorkSpace Operations

//--Getting all workspaces
app.post('/allWorkSpace', function(req, res){
    db.workspace.find(function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            //console.log(data);
            res.send(data);
        };
    });
});

//--Getting all apps
app.post('/getApps', function(req, res){
    query = req.body;
    db.boolApp.find(query,function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            //console.log(data);
            res.send(data);
        };
    });
});

//Getting all App Objects
app.post('/getAppObjs', function(req, res){
    query = req.body;
    db.boolAppObj.find(query,function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            //console.log(data);
            res.send(data);
        };
    });
});

//Getting all App Controller Objects
app.post('/getAppCtrlObjs', function(req, res){
    query = req.body;
    db.boolCtrl.find(query,function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

//Getting all Objects under the scope of a controller
app.post('/getScopeObjs', function(req, res){
    ctrlId = req.body.ctrlId;
    appIsn = req.body.appIsn;
    db.boolCtrl.find({_id:ObjectId(ctrlId)},function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            scopeRootObj = data[0].ctrlScope;
            console.log(appIsn, scopeRootObj);
            db.boolAppObj.find({appIsn:appIsn, objName:scopeRootObj}, function(err, resp){
                console.log(resp);
                res.send(resp);
            });
        };
    });
});

//Getting all Events
app.post('/getEvents', function(req, res){
    db.boolEvent.find(function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

//Getting all Actions
app.post('/getActions', function(req, res){
    db.boolAction.find(function(err, data){
        if( err || !data) console.log("No data found!");
        else {
            console.log(data);
            res.send(data);
        };
    });
});

//--Saving a new workspace
app.post('/addWorkSpace', function(req, res){
    ws = req.body;
    //console.log(ws);
    db.workspace.insert(ws);
    res.send("ws saved Successfully!");
});

//--Saving a new workspace user
app.post('/addWorkSpaceUser', function(req, res){
    wsu = req.body;
    //console.log(wsu);
    db.wsuser.insert(wsu);
    res.send("workspace user saved Successfully!");
});

//--Saving a new App
app.post('/addApp', function(req, res){
    myapp = req.body;
    console.log(myapp);
    //db.boolApp.insert(myapp);
    db.boolApp.insert(myapp, function (err, saved) {
        if(err) res.send("Could not save app!");
        else{
            db.boolApp.findOne({'appName':myapp.appName},function(err, data){
                if( err || !data) console.log("App not found!");
                else {
                    obj0 = {"isn" : 0, "appIsn" : String(data._id), "parentIsn" : 0, baseWigName:"page", "baseWigCode" : "<div class='bool-container container-fluid'></div>", "objType" : "container", "objName" : "page1", "objSeq" : 0, "objWidth" : 12, "objOffset" : 0, "objRow" : "default", objOps:{pageId:1}};
                    console.log(String(data._id));
                    db.boolAppObj.insert(obj0);
                    //res.send(data);
                };
            });
            res.send("app saved Successfully!")
        }
    });
});

/*Controller Operations*/

//Save new controller
app.post('/ctrlCreate', function(req, res){
    myapp = req.body;
    console.log(myapp);
    db.boolCtrl.insert(myapp);
    res.send("Controller saved Successfully!");
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
