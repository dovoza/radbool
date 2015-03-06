//Angular Modules
var myapp = angular.module('dovoza',[]);



//JQuery Events
$("document").ready(function(){
	var mynode = new boolNode(1,1);
	mynode.setData('<div class="test">something</div>');

	console.log(mynode.getData());
});