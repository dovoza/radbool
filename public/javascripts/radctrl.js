//Angular Modules
//angular.module('showcase', ['datatables']);
var radbool = angular.module('radbool',['datatables', 'datatables.bootstrap']);

//RADBOOL Services
radbool.factory('initPams', function($http, $q, sessionPams){
	var boolFac = {};
	//Fetch All available workspace from database
	boolFac.allWS = function(){
		var deferred = $q.defer();
		$http.post('/allWorkSpace').success(function (resp) {
			deferred.resolve(resp);
		}).error(function (resp) {
			deferred.reject(resp); 
		});

		return deferred.promise;
	}

	boolFac.getApps = function(){
		currWs = sessionPams.getWS();
		var deferred = $q.defer();
		$http.post('/getApps', {appWs:currWs}).success(function (resp) {
			deferred.resolve(resp);
			//boolFac.workspaces = resp;
		}).error(function (resp) {
			deferred.reject(resp); 
		});

		return deferred.promise;
	}

	return boolFac;
});

radbool.factory('sessionPams', function($http, $q){
	var boolSess = {};

	boolSess.wsName = null;
	boolSess.appName = null;
	boolSess.appIsn = null;
	boolSess.user = null;

	//Current App struct
	boolSess.currAppStruct = null;

	boolSess.setWS = function(wsname){
		boolSess.wsName = wsname;
	}

	boolSess.setAppName = function(appname){
		boolSess.appName = appname;
	}

	boolSess.setAppIsn = function(appIsn){
		boolSess.appIsn = appIsn;
	}

	boolSess.setUser = function(username){
		boolSess.user = username;
	}

	boolSess.getWS = function(){
		return boolSess.wsName;
	}

	boolSess.getAppName = function(){
		return boolSess.appName;
	}

	boolSess.getAppIsn = function(){
		return boolSess.appIsn;
	}

	boolSess.getCurrAppStruct = function(){
		currApp = boolSess.appIsn;
		var deferred = $q.defer();
		$http.post('/getAppObjs', {appIsn:currApp}).success(function (resp) {
			deferred.resolve(resp);
			//boolFac.workspaces = resp;
		}).error(function (resp) {
			deferred.reject(resp); 
		});

		return deferred.promise;
	}

	boolSess.getCurrAppConts = function(){
		/*Get all container objects for currently selected app*/
		currApp = boolSess.appIsn;
		var deferred = $q.defer();
		$http.post('/getAppObjs', {appIsn:currApp, objType:"container"}).success(function (resp) {
			deferred.resolve(resp);
			//boolFac.workspaces = resp;
		}).error(function (resp) {
			deferred.reject(resp); 
		});

		return deferred.promise;
	}

	boolSess.getCurrAppCtrls = function(){
		/*Get all controller objects for currently selected app*/
		currApp = boolSess.appIsn;
		var deferred = $q.defer();
		$http.post('/getAppCtrlObjs', {appIsn:currApp}).success(function (resp) {
			deferred.resolve(resp);
			//boolFac.workspaces = resp;
		}).error(function (resp) {
			deferred.reject(resp); 
		});

		return deferred.promise;
	}

	boolSess.getUser = function(){
		return boolSess.user;
	}

	return boolSess;
});

//RADBOOL Controllers

//Login Controller
radbool.controller('loginCtrl',['$scope','$http', 'initPams', 'sessionPams', function($scope, $http, initPams, sessionPams){
	$scope.isLogged = false;
	$scope.uname = '';
	$scope.wsname = '';

	$scope.login = function(){
		$scope.uname = "admin";
		$scope.wsname = "admin";
		$scope.isLogged = true;

		//Set variables in the session parameters service
		sessionPams.setWS($scope.wsname);
		sessionPams.setUser($scope.uname);
	}

	$scope.logout = function(){
		$scope.isLogged = false;
	}
}]);

//Admin Controller
radbool.controller('adminCtrl',['$scope','$http', 'initPams', 'sessionPams', function($scope, $http, initPams, sessionPams){
    //Init Params
    $scope.refresh = function() {
      initPams.allWS()
        .then(function (data) {
          $scope.workspaces = data;
        })
    }

    $scope.currApps = function() {
      initPams.getApps()
        .then(function (data) {
          $scope.myApps = data;
          console.log(data);
        })
    }

    
    $scope.refresh();

    //Init variables
	$scope.appIsn = 0;
	$scope.showWScreateForm = false;
	$scope.showWSUserCreateForm = false;
	$scope.showAppForm = false;
	$scope.appShow = false;
	$scope.wsName = null;
	$scope.passkeyMatch = false;
	$scope.appName = null;
    
    //Show or hide workspace creation Warlock
	$scope.showWSForm = function(){
		/*Hide all shown views and forms in the action centre*/
		if ($scope.showWScreateForm) {
			$scope.wsName = null;
			$scope.showWScreateForm = false;
		}else{
			$scope.showWScreateForm = true;
			$scope.showWSUserCreateForm = false;
			$scope.showAppForm = false;
			$scope.appShow = false;
		}
	}

	$scope.showWSUserForm = function(){
		/*Hide all shown views and forms in the action centre*/
		if ($scope.showWSUserCreateForm) {
			//$scope.wsName = null;
			$scope.showWSUserCreateForm = false;
		}else{
			$scope.showWSUserCreateForm = true;
			$scope.showWScreateForm = false;
			$scope.showAppForm = false;
			$scope.appShow = false;
		}
	}

	$scope.showAppCreateForm = function(){
		/*Hide all shown views and forms in the action centre*/
		if ($scope.showAppForm) {
			//$scope.wsName = null;
			$scope.showAppForm = false;
		}else{
			$scope.showAppForm = true;
			$scope.showWScreateForm = false;
			$scope.showWSUserCreateForm = false;
			$scope.appShow = false;
		}
	}

	//Show all Apps for the current workspace
	$scope.showApps = function(){
		$scope.currApps();
		if ($scope.appShow) {
			//$scope.wsName = null;
			$scope.appShow = false;
		}else{
			$scope.appShow = true;
			$scope.showWScreateForm = false;
			$scope.showWSUserCreateForm = false;
			$scope.showAppForm = false;
		}
	}

    //Save a new workspace
	$scope.createWS = function(){
		$http.post('/addWorkSpace', {wsname:$scope.wsName}).success(function (resp) {
			console.log(resp);
			$scope.wsName = null;
			$scope.refresh();
		}).error(function () {
			console.log("Error");
		});
	}

	//Save a new Application
	$scope.createApp = function(){
		appObj = {appName:$scope.appName, appWs:sessionPams.getWS(), appOwner:sessionPams.getUser()};
		$http.post('/addApp', appObj).success(function (resp) {
			console.log(resp);
			$scope.appName = null;
			$scope.currApps(); //Refresh Apps List
		}).error(function () {
			console.log("Error");
		});
	}

	//Render Current App
	$scope.renderApp = function(){
		currAppIsn = sessionPams.getAppIsn();
		console.log("Rendering app....");
		$http.post('/renderApp', {appIsn:currAppIsn}).success(function (resp) {
			console.log(resp);
			window.open("http://localhost:3001/radbool");
		}).error(function () {
			console.log("Error");
		});
	}

    //Password Match Check function
	$scope.passMatch = function(){
		$scope.passkeyMatch = $scope.wsupass == $scope.wsupassconf;
		//console.log(initPams.workspaces);
	}

	//Save new user
	$scope.createWSUser = function(){
		$http.post('/addWorkSpaceUser', {wsuname:$scope.wsuname, wsupass:$scope.wsupass, wsid:$scope.wsid}).success(function (resp) {
			console.log(resp);
			$scope.wsuname = null;
			$scope.wsupass = null;
			$scope.wsupassconf = null;
		}).error(function () {
			console.log("Error");
		});
	}

	//Set Application variable on select
	$scope.selectApp = function(appname,appIsn){
		console.log(appname);
		console.log(appIsn);
		$scope.selectedApp = appname;
		sessionPams.setAppName(appname);
		sessionPams.setAppIsn(appIsn);
	}

}]);

radbool.controller('panelCreate',['$scope','$http','sessionPams', function($scope, $http, sessionPams){
	$scope.act = "panelCreate";
	$scope.panelId = null;
	$scope.panelParId = null;
	$scope.panelInstWidth = 1;
	$scope.panelInstOffset = 0;
	$scope.panelRow = "default";
	$scope.panelTitle = null;
	$scope.panelTitleSize = 6;
	$scope.panelType = "default";
	$scope.panelSeq = 1;
	$scope.hasHeaderPanel = false;
	$scope.hasFooterPanel = false;
	$scope.isModalPanel   = false;
	$scope.objType = "container";

	$scope.panelSave = function(){
		$scope.appIsn = sessionPams.getAppIsn();

		this.data = {appIsn : $scope.appIsn, panelId:$scope.panelId, panelParId:$scope.panelParId, panelInstWidth:$scope.panelInstWidth, panelInstOffset:$scope.panelInstOffset,
			panelRow:$scope.panelRow, panelTitle:$scope.panelTitle, panelTitleSize:$scope.panelTitleSize, panelType:$scope.panelType, panelSeq:$scope.panelSeq, hasHeaderPanel:$scope.hasHeaderPanel, 
			hasFooterPanel:$scope.hasFooterPanel, isModalPanel:$scope.isModalPanel, objType:$scope.objType};

		$http.post('/panelSave', this.data).success(function(resp){
			console.log(resp);
		});
	}

}]);

//Tab Controller
radbool.controller('tabCreate',['$scope','$http','sessionPams', function($scope, $http, sessionPams){
	$scope.tabNavLinks = [];
	$scope.tabMenuLinks = [];
	$scope.menunavs = [];

	$scope.addNavLink = function(){
		tabNavLink = {navid:$scope.navid, navtitle:$scope.navtitle, navtype:$scope.navtype}
		$scope.tabNavLinks.push(tabNavLink);
		if ($scope.navtype == "menu") {
			$scope.menunavs.push(tabNavLink);
		};
		//console.log($scope.tabNavLinks);
	}

	$scope.addMenuLink = function(){
		tabMenuLink = {menunavid:$scope.menunavid, menunavtitle:$scope.menunavtitle, parentnavid:$scope.parentnavid};
		$scope.tabMenuLinks.push(tabMenuLink);
		//console.log($scope.tabMenuLinks)
	}

	$scope.tabSave = function(){
		$scope.appIsn = sessionPams.getAppIsn();
		tabData = {"appIsn" : $scope.appIsn, "parentIsn" : $scope.tabObjParId, baseWigName:"tab", "baseWigCode" : "<div class='tab-container bool-container'></div>", "objType" : "container", "objName" : $scope.tabObjId, "objSeq" : $scope.tabSeq, "objWidth" : $scope.tabInstWidth, "objOffset" : $scope.tabInstOffset, "objRow" : $scope.tabInstRow, objOps:{tabType:$scope.tabType, tabStacking:$scope.tabStacking, tabNavLinks:$scope.tabNavLinks, tabMenuLinks:$scope.tabMenuLinks}};
		console.log(tabData);
		$http.post('/tabSave', tabData).success(function(resp){
			console.log(resp);
		});
	}
}]);

//Form Controller
radbool.controller('formCreate',['$scope','$http', 'sessionPams', function($scope, $http, sessionPams){

	$scope.formSave = function(){
		$scope.appIsn = sessionPams.getAppIsn();
		formObj = {"appIsn" : $scope.appIsn, "parentIsn" : $scope.formObjParId, baseWigName:"form", "baseWigCode" : "<form class='bool-container' role='form'></form>", "objType" : "container", "objName" : $scope.formObjId, "objSeq" : $scope.formSeq, "objWidth" : $scope.formInstWidth, "objOffset" : $scope.formInstOffset, "objRow" : $scope.formInstRow, objOps:{"formType" : $scope.formType} };
		//console.log("Form widget save...");
		$http.post('/formSave', formObj).success(function(resp){
			console.log(resp);
		});
	}
	
}]);

radbool.controller('textCreate',['$scope','$http', 'sessionPams', function($scope, $http, sessionPams){

	$scope.textSave = function(){
		$scope.appIsn = sessionPams.getAppIsn();

		if ($scope.textInputType == "Text") {
			baseWigCode = "<input type='text' class='form-control bool-input' />";
			baseWigName = "textfield";
		}else if ($scope.textInputType == "TextArea") {
			baseWigCode = "<textarea class='form-control bool-input'></textarea>";
			baseWigName = "textarea";
		}else if ($scope.textInputType == "Password") {
			baseWigCode = "<input type='password' class='form-control bool-input' />";
			baseWigName = "password";
		}else if ($scope.textInputType == "Hidden") {
			baseWigCode = "<input type='hidden' class='form-control bool-input' />";
			baseWigName = "hidden";
		}


		textObjOps = {"textInputLabel":$scope.textInputLabel, "textInputType":$scope.textInputType, "textInputMin":$scope.textInputMin, "textInputMax":$scope.textInputMax, "textInputReg":$scope.textInputReg, "textInputRequired":$scope.textInputRequired };
		textObj = {"appIsn" : $scope.appIsn, "parentIsn" : $scope.textObjParId, "baseWigName":baseWigName, "baseWigCode" : baseWigCode, "objType" : "input", "objName" : $scope.textObjId, "objSeq" : $scope.textSeq, "objWidth" : $scope.textInstWidth, "objOffset" : $scope.textInstOffset, "objRow" : $scope.textInstRow, "objOps":textObjOps };
		//console.log("Form widget save...");
		$http.post('/textSave', textObj).success(function(resp){
			console.log(resp);
		});
	}
	
}]);

radbool.controller('typoCreate',['$scope', '$http', 'sessionPams',function($scope, $http, sessionPams){
	$scope.typoHeadingShow = false;
	$scope.typoLeadShow = false;
	$scope.typoEmphasisShow = false;
	$scope.typoBlockShow = false;
	$scope.typoListsShow = false;
	$scope.typoAddrShow = false;
	$scope.typoStaticTextShow = false;
	$scope.typoDbTextShow = false;
	$scope.typoServiceTextShow = false;
	$scope.typoTypeSelect = function(){
		if ($scope.typoType == 'Heading') {
			$scope.typoHeadingShow = true;
			$scope.typoLeadShow = false;
			$scope.typoEmphasisShow = false;
			$scope.typoBlockShow = false;
			$scope.typoListsShow = false;
			$scope.typoAddrShow = false;
		}else if($scope.typoType == 'Lead'){
			$scope.typoLeadShow = true;
			$scope.typoHeadingShow = false;
			$scope.typoEmphasisShow = false;
			$scope.typoBlockShow = false;
			$scope.typoListsShow = false;
			$scope.typoAddrShow = false;
		}else if ($scope.typoType == 'Emphasis') {
			$scope.typoEmphasisShow = true;
			$scope.typoHeadingShow = false;
			$scope.typoLeadShow = false;
			$scope.typoBlockShow = false;
			$scope.typoListsShow = false;
			$scope.typoAddrShow = false;
		}else if ($scope.typoType == 'Blockquotes') {
			$scope.typoBlockShow = true;
			$scope.typoHeadingShow = false;
			$scope.typoLeadShow = false;
			$scope.typoEmphasisShow = false;
			$scope.typoListsShow = false;
			$scope.typoAddrShow = false;
		}else if ($scope.typoType == 'Lists') {
			$scope.typoListsShow = true;
			$scope.typoHeadingShow = false;
			$scope.typoLeadShow = false;
			$scope.typoEmphasisShow = false;
			$scope.typoBlockShow = false;
			$scope.typoAddrShow = false;
		}else if ($scope.typoType == 'Addresses') {
			$scope.typoAddrShow = true;
			$scope.typoHeadingShow = false;
			$scope.typoLeadShow = false;
			$scope.typoEmphasisShow = false;
			$scope.typoBlockShow = false;
			$scope.typoListsShow = false;
		};
	}

	$scope.typoTextSourceSelect = function(){
		if ($scope.typoTextSource == 'Static Text') {
			$scope.typoStaticTextShow = true;
			$scope.typoDbTextShow = false;
			$scope.typoServiceTextShow = false;
		}else if ($scope.typoTextSource == 'Database Text') {
			$scope.typoStaticTextShow = false;
			$scope.typoDbTextShow = true;
			$scope.typoServiceTextShow = false;
		}else if ($scope.typoTextSource == 'Service Text') {
			$scope.typoStaticTextShow = false;
			$scope.typoDbTextShow = false;
			$scope.typoServiceTextShow = true;
		};
	}

	$scope.typoSave = function(){
		console.log("Typograghy saving...")
	}
}]);

//Global Controller
radbool.controller('globalCtrl',['$scope','$http', 'initPams', 'sessionPams', function($scope, $http, initPams, sessionPams, DTOptionsBuilder, DTColumnBuilder){

	var vm = this;

	//Refresh Current App's Object List
	$scope.refreshAppObjs = function() {
      sessionPams.getCurrAppStruct()
        .then(function (data) {
          $scope.currAppObjs = data;
          console.log(data);
        })
    }

    $scope.refreshAppConts = function() {
      sessionPams.getCurrAppConts()
        .then(function (data) {
          $scope.cont = data;
          console.log("Refresh Conts");
          console.log(data);
        })
    }

	$scope.viewTabSelect = function(){
		console.log("View tab");
		$scope.refreshAppObjs();
	}

	$scope.ctrlTabSelect = function(){
		console.log("Controller Tab");
		$scope.refreshAppObjs();
	}


}]);

//Controller Tab controller
radbool.controller('ctrlTabCtrl',['$scope','$http', 'initPams', 'sessionPams', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, initPams, sessionPams, DTOptionsBuilder, DTColumnBuilder){
    //Init variables
    $scope.actSaveToDB = false;
	//Getting All Events and Actions
	$http.post('/getEvents').success(function(resp){
		console.log(resp);
		$scope.events = resp;
	});

	$http.post('/getActions').success(function(resp){
		console.log(resp);
		$scope.acts = resp;
	});
	
    $scope.saveCtrl = function(){
    	appName = sessionPams.getAppName();
    	appIsn = sessionPams.getAppIsn();
    	ws = sessionPams.getWS();
    	ctrlName = $scope.ctrlName;
    	ctrlScope = $scope.ctrlScope;

    	$http.post('/ctrlCreate',{wsname:ws, appIsn:appIsn, appName:appName, ctrlName:ctrlName, ctrlScope:ctrlScope}).success(function (resp) {
			console.log(resp);
		})
    }

    $scope.refreshAppCtrls = function() {
      sessionPams.getCurrAppCtrls()
        .then(function (data) {
          $scope.appCtrls = data;
          console.log("Refresh Conts");
          console.log(data);
        })
    }

    $scope.ctrlSelect = function(){
    	appIsn = sessionPams.getAppIsn();
    	console.log($scope.actCtrlName);
    	sessionPams.getCurrAppStruct()
    	.then(function(data){
    		$scope.selCtrlObjs = data;
    	});
    	//Code to be used when selecting objects by selected controller
    	/*$http.post('/getScopeObjs', {ctrlId:$scope.actCtrlName, appIsn:appIsn}).success(function(resp){
			console.log(resp);
		});*/
    }

    /*$scope.$watch('actCtrlName', function (oldValue, newValue) {
    	console.log(oldValue, newValue);
    })*/

    $scope.actChange = function(){
    	if ($scope.actAction == "Save Form to DB") {
    		$scope.actSaveToDB = true;
    	}else{
    		$scope.actSaveToDB = false;
    	}
    }

}]);

//Angular datatables test controller
radbool.controller('tblCtrl',['$scope','$http', 'initPams', 'sessionPams', 'DTOptionsBuilder', 'DTColumnBuilder', function($scope, $http, initPams, sessionPams, DTOptionsBuilder, DTColumnBuilder){
	/*var vm = this;
    vm.persons = persons;*/
}]);