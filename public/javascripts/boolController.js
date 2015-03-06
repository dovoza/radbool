//Angular Modules
var boolCreator = angular.module('boolCreator',[]);

//Panel Controller
boolCreator.controller('panelCreate',['$scope','$http', function($scope, $http){
	$scope.appIsn = 1;
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

	$scope.cont = null;
	data = {};

	//Get all container objects
	$http.post('/getCont', data).success(function(resp){
		$scope.cont = resp;
	});

	$scope.panelSave = function(){
		this.data = {appIsn : $scope.appIsn, panelId:$scope.panelId, panelParId:$scope.panelParId, panelInstWidth:$scope.panelInstWidth, panelInstOffset:$scope.panelInstOffset,
			panelRow:$scope.panelRow, panelTitle:$scope.panelTitle, panelTitleSize:$scope.panelTitleSize, panelType:$scope.panelType, panelSeq:$scope.panelSeq, hasHeaderPanel:$scope.hasHeaderPanel, 
			hasFooterPanel:$scope.hasFooterPanel, isModalPanel:$scope.isModalPanel, objType:$scope.objType};

		$http.post('/panelSave', this.data).success(function(resp){
			console.log(resp);
		});
	}

	$scope.testBase = function(){
		this.data = {test:'test'};
		$http.post('/testdb', this.data).success(function(resp){
			console.log(resp);
		});
	}

}]);

//Tab Controller
boolCreator.controller('tabCreate',['$scope','$http', function($scope, $http){
	$scope.appIsn = 1;

	$scope.tabSave = function(){
		alert($("#tabid").val());
		/*$http.post('/tabSave', this.data).success(function(resp){
			console.log(resp);
		});*/
	}
}]);

inApp.factory('boolCrud', function($http){
	var crud = {};

	crud.insert = function(colName, doc){
		$http.post('/in/validate.php', pinsArr).success(function(resp){
			console.log(resp);
	    });
	}

	return crud;


});


