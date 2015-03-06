var dvDirectives = angular.module('dvDirectives',[]);
$(function () { $("[data-toggle='popover']").popover(); });

/*dvDirectives.directive('dvPanel', function(){
	return {
		restrict: "E",
		scope: {conf:'@'},
		replace: true,
		transclude: true,
		template: '\
		<div class="row-fluid">\
          <div>\
		    <div class="panel">\
		      <div class="panel-heading"></div>\
		      <div class="panel-body" ng-transclude></div>\
		    </div>\
		  </div>\
		</div>',
		link: function ($scope, element, attrs) {
			attrb = JSON.parse(attrs.conf);
			pType = "panel-"+attrb.type;
			pTitle = "<h"+attrb.titleSize+">"+attrb.title+"</h"+attrb.titleSize+">";
			pWidth = "col-sm-"+attrb.width;
			pOffset= "col-sm-offset-"+attrb.offset;
			var panel = angular.element(element.children()[0]);
			var panelCont = angular.element(panel.children()[0]);
			var panelHeader = angular.element(panelCont.children()[0]);
			panelHeader.html(pTitle);
			//panelCont.append('<div class="panel-footer"></div>');
			panelCont.addClass(pType);
			panel.addClass(pWidth);
			panel.addClass(pOffset);
			//myTest = element.find('div').children()[0];
			//console.log(panelCont);
		}
	}
});*/

dvDirectives.directive('dvPanel', function(){
	return {
		restrict: "A",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template: '<div class="row-fluid"><div><div class="panel" ng-transclude></div></div></div>',
		link: function($scope, element, attrs){
			attrb = JSON.parse(attrs.conf);
			pType = "panel-"+attrb.type;
			pWidth = "col-sm-"+attrb.width;
			pOffset= "col-sm-offset-"+attrb.offset;
			var panel = angular.element(element.children()[0]);
			var panelCont = angular.element(panel.children()[0]);
			panelCont.addClass(pType);
			panel.addClass(pWidth);
			panel.addClass(pOffset);
			//element.wrap("<div class='test'></div>");
			console.log(element.html());
		}
	}
});

dvDirectives.directive('dvPanelHead', function(){
	return {
		restrict: "A",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template: '<div class="panel-heading" ng-transclude></div>',
		link: function($scope, element, attrs){
			attrb = JSON.parse(attrs.conf);
			if (attrb.hasTitle) {
				pTitle = "<h"+attrb.titleSize+">"+attrb.title+"</h"+attrb.titleSize+">";
				pHead = angular.element(element);
				pHead.html(pTitle);
			};
		}
	}
});

dvDirectives.directive('dvPanelBody', function(){
	return {
		restrict: "A",
		replace: true,
		transclude: true,
		template: '<div class="panel-body" ng-transclude></div>'
	}
});

dvDirectives.directive('dvPanelFoot', function(){
	return {
		restrict: "A",
		replace: true,
		transclude: true,
		template: '<div class="panel-footer" ng-transclude></div>'
	}
});

dvDirectives.directive('dvTab', function(){
	return {
		restrict: "E",
		scope: {conf:'@', links:'@', linktits:'@'},
		replace: true,
		transclude: true,
		template: '\
		<div class"row-fluid">\
		  <div>\
		    <ul class="nav"></ul>\
		    <div class="tab-content" ng-transclude></div>\
		  </div>\
		</div>',
		link: function($scope, element, attrs){
			attrb = JSON.parse(attrs.conf);
			titles = JSON.parse(attrs.linktits);
			stacked = attrb.stacked;
			tWidth = "col-sm-"+attrb.width;
			tOffset= "col-sm-offset-"+attrb.offset;
			links = attrs.links.split(',');
			linkObj = [];
			links.forEach(function(item){
				obj = {};
				obj["link"] = item;
				linkObj.push(obj);
				//console.log(linkObj);
			});
			tType = "nav-"+attrb.type;
			var tab = angular.element(element.children()[0]);
			var nav = angular.element(tab.children()[0]);
			nav.addClass(tType);
			linkObj.forEach(function(link){
				linkName = link.link;
				linkTit = titles[linkName];
				nav.append('<li><a href="#'+link.link+'" data-toggle="tab">'+linkTit+'</a></li>');
			});
			if (stacked) {nav.addClass("nav-stacked")};
			tab.addClass(tWidth);
			tab.addClass(tOffset);
			//console.log(nav.html());
		}
	}
});

dvDirectives.directive('dvTabPane',function(){
	return {
		restrict: "E",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template: '\
		  <div class="tab-pane" ng-transclude></div>\
		',
		link: function($scope, element, attrs){
			attrb = JSON.parse(attrs.conf);
			isActive = "";
			anim = attrb.anim;
			if(attrb.active){
				isActive = "in active";
			}
			element.addClass(isActive);
			element.addClass(anim);
			id = attrb.linkTo;
			element.attr("id", id);
			//console.log($('this').html());
		}
	}
});

dvDirectives.directive('dvAccordion', function(){
	return {
		restrict: "E",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template:'\
		  <div class="row-fluid">\
		    <div>\
		      <div class="panel-group" id="accordion" ng-transclude></div>\
		    </div>\
		  </div>\
		',
		link: function($scope,element, attrs){
			attrb = JSON.parse(attrs.conf);
			aWidth = "col-sm-"+attrb.width;
			aOffset= "col-sm-offset-"+attrb.offset;
			var acc = angular.element(element.children()[0]);
			var accCont = angular.element(acc.children()[0]);
			acc.addClass(aWidth);
			acc.addClass(aOffset);
			accCont.attr("id", attrb.id);
		}
	}
});

dvDirectives.directive('dvAccordionPane', function(){
	return {
		restrict: "E",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template:'\
		  <div class="panel panel-default">\
            <div class="panel-heading">\
            </div>\
            <div class="panel-collapse collapse in">\
              <div class="panel-body" ng-transclude></div>\
            </div>\
          </div>',
		link: function($scope,element, attrs){
			attrb = JSON.parse(attrs.conf);
			pId = attrb.id;
			pParId = attrb.parentId;
			pType = "panel-"+attrb.type;
			pTitle = '<h'+attrb.titleSize+' class="panel-title"><a data-toggle="collapse" data-parent="#'+pParId+'" href="#'+pId+'">'+attrb.title+'</a></h'+attrb.titleSize+'>';
			var panelHeader = angular.element(element.children()[0]);
			var panelBodyCont = angular.element(element.children()[1]);
			panelHeader.html(pTitle);
			panelBodyCont.attr("id", pId);
			element.addClass(pType);
		}
	}
});

dvDirectives.directive('dvDataTable', function(){
	return {
		restrict: "E",
		scope: {conf: '@'},
		replace: true,
		transclude: true,
		template:'<table class="table table-striped table-bordered"><caption></caption><thead></thead><tbody></tbody></table>',
		link: function($scope,element, attrs){
			attrb = JSON.parse(attrs.conf);
			aWidth = "col-sm-"+attrb.width;
			aOffset= "col-sm-offset-"+attrb.offset;
			var acc = angular.element(element.children()[0]);
			var accCont = angular.element(acc.children()[0]);
			acc.addClass(aWidth);
			acc.addClass(aOffset);
			accCont.attr("id", attrb.id);
		}
	}
});