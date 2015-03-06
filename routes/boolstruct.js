//DB Connection
var dburl = "localhost/radbool";
var collections = ["bool_base_widget","boolAppObj"];
var fs = require('fs');
var db = require("mongojs").connect(dburl, collections);

//DOM Manipulator
var cheerio = require('cheerio');

function boolNode(nodeIsn, nodeSeq, nodeParIsn){
	var self = this;
	//Properties
	self.nodeIsn = nodeIsn;
	self.nodeParIsn = nodeParIsn;
	self.nodeData = '';
	self.baseWigName = null;
	self.nodeOps = null;
	self.nodeWidth = null;
	self.nodeRow = null;
	self.nodeOffset = null;
	self.nodeId = null;
	self.seq = nodeSeq;

	//Methods
	self.setParent = function(newParIsn){
		self.nodeParIsn = newParIsn;
	}

	self.getData = function(){
		return self.nodeData;
	}

	self.setData = function(newData){
		self.nodeData = newData;
	}
}

function boolTree(){
	var self = this;
	self.treeData = [];

	//var rootNode = new boolNode(rootNodeIsn, 0,null);
	//this.treeData.push(rootNode);

	this.inArray = function(value, array){
		return array.indexOf(value) > -1;
	}

	this.isArr = function(arr){
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	this.inMulti = function(needle, haystack){
		found = false;
		haystack.forEach(function(stack){
			//console.log(stack);
			stack.forEach(function(val){
				if (val == needle) {
					//console.log(val);
					found = true;
				}
			});
		})

		return found;
	}

	this.pushNode = function(nodeIsn, nodeSeq, nodeParIsn, pos){
		var myNode = new boolNode(nodeIsn, nodeSeq, nodeParIsn);
		self.treeData[pos] = myNode;
	}

	this.hasChildren = function(nodeParIsn){
		self.treeData.forEach(function(node){
			if (node.nodeParIsn == nodeParIsn) {
				//console.log(nodeParIsn);
				return true;
			};
		});

		return false;
	}

	this.getChildren = function(nodeParIsn){
		children = [];
		self.treeData.forEach(function(node){
			if (node.nodeParIsn == nodeParIsn) {
				children.push(node);
			};
		});

		return children;
	}

	this.hasSiblings = function(nodeIsn){
		parent = null;
		sibs   = false;

		self.treeData.forEach(function(node){
			if (node.nodeIsn == nodeIsn) {
				parent = node.nodeParIsn;
				return;
			};
		});

		self.treeData.forEach(function(node){
			if (node.nodeParIsn == parent && node.nodeIsn != nodeIsn && node.nodeParIsn != null) {
				sibs = true;
				return;
			};
		});

		return sibs;
	}

	this.getSiblings = function(nodeIsn){
		parent = null;
		sibs   = [];

		self.treeData.forEach(function(node){
			if(node.nodeIsn == nodeIsn){
				parent = node.nodeParIsn;
				return;
			}
		});

		self.treeData.forEach(function(node){
			if (node.nodeParIsn == parent && node.nodeIsn != nodeIsn) {
				sibs.push(node.nodeIsn);
			};
		});

		return sibs;
	}

	this.printTree = function(){
		levels = [];

		self.treeData.forEach(function(node){
			sibs = [];
			if(!(self.inMulti(node.nodeIsn, levels))){
				if (node.nodeParIsn == 0) {
					sibs.push(node.nodeIsn);
					levels.push(sibs);
					//console.log(node);
				}else{
					nodeSibs = self.getSiblings(node.nodeIsn);
					nodeSibs.push(node.nodeIsn);

					if (self.hasSiblings(node.nodeParIsn)) {
						currKey = levels.length;
						nodeParSibs = levels[currKey - 1];
                        //console.log(self.treeData);
						nodeParSibs.forEach(function(parent){
							if (parent != node.nodeParIsn) {
								children = self.getChildren(parent);
								children.forEach(function(child){
									nodeSibs.push(child.nodeIsn);
								});
							};
						});
						levels.push(nodeSibs);
					}else{
						levels.push(nodeSibs);
					}
				}
			}
		});

		return levels;
	}

	this.depth = function(){
		tree = self.printTree();

		return tree.length;
	}

	this.getLevel = function(x){
		tree = self.printTree();

		return tree[x];
	}

	this.setNodeData = function(nodeIsn, newData, nodeWigName, objOps, nodeWidth, nodeRow, nodeOffset, nodeId){
		self.treeData.forEach(function(node){
			if (node.nodeIsn == nodeIsn) {
				node.nodeData = newData;
				node.baseWigName = nodeWigName;
				node.nodeOps = objOps;
				node.nodeWidth = nodeWidth;
				node.nodeRow = nodeRow;
				node.nodeOffset = nodeOffset;
				node.nodeId = nodeId;
			};
		});
	}

	this.getNodeData = function(nodeIsn){
		self.treeData.forEach(function(node){
			if (node.nodeIsn == nodeIsn) {
				nodeData = node.nodeData;
			};
		});
		return nodeData;
	}

	this.concatSibs = function(nodeParIsn){
		nodes = self.getChildren(nodeParIsn);
		nodes.sort(self.dynamicSort("seq"));
		sibsData = ' ';

		nodes.forEach(function(node){
			sibsData += ' '+node.nodeData;
		});

		return sibsData;
	}

	this.attrSet = function(nodeIsn){
		self.treeData.forEach(function(node){
			if (node.nodeIsn == nodeIsn) {
				//console.log(node.baseWigName);
				if (node.baseWigName == "panel") {
					panelType = "panel-"+node.nodeOps.panelType;
					panelWidthElem = '<div class="col-sm-'+node.nodeWidth+'"></div>';
					parData  = self.getNodeData(nodeIsn);
					$ = cheerio.load(parData);
					if($('div').hasClass('panel')){
					  $('div').addClass(panelType);
				    }
				    newParData = $.html();
				    $ = cheerio.load(panelWidthElem);
				    $('div').append(newParData);
				    newParData = $.html();
				    self.setNodeData(nodeIsn, newParData);

				}else if (node.baseWigName == "panel-header") {
					titSize = node.nodeOps.panelTitleSize;
					tit = node.nodeOps.panelTitle;
					parData  = self.getNodeData(nodeIsn);
					$ = cheerio.load(parData);
					panelTitle = "<h"+titSize+">"+tit+"</h"+titSize+">";
					if($('div').hasClass('panel-title')){
					  $('.panel-title').append(panelTitle);
				    }
				    newParData = $.html();
				    self.setNodeData(nodeIsn, newParData);
				}else if (node.baseWigName == "form") {
					//console.log(node.baseWigName);
					formType = "form-"+node.nodeOps.formType;
					formWidthElem = '<div class="col-sm-'+node.nodeWidth+'"></div>';
					parData  = self.getNodeData(nodeIsn);
					$ = cheerio.load(parData);
					if($('form').hasClass('bool-container')){
					  $('form').addClass(formType);
				    }
				    newParData = $.html();
				    $ = cheerio.load(formWidthElem);
				    $('div').append(newParData);
				    newParData = $.html();
				    //console.log(newParData);
				    self.setNodeData(nodeIsn, newParData);

				}else if (node.baseWigName == "textfield") {
					inpLabel = node.nodeOps.textInputLabel;
					inpMin = node.nodeOps.textInputMin;
					inpMax = node.nodeOps.textInputMax;
					inpReg = node.nodeOps.textInputReg;
					inpRequired = node.nodeOps.textInputRequired;
					fieldLabel = '<label for="'+node.nodeId+'" class="control-label">'+inpLabel+':</label>';
					textWidthElem = '<div class="col-sm-'+node.nodeWidth+'"></div>';
					grp = "<div class='form-group'></div>"
					parData  = self.getNodeData(nodeIsn);
					$ = cheerio.load(parData);
					if($('.form-control').hasClass('bool-input')){
					  //console.log(parData);
					  $('.bool-input').attr('id', node.nodeId);
					  $('.bool-input').attr('ng-model', node.nodeId);
				    }
				    newParData = $.html();
				    $ = cheerio.load(textWidthElem);
				    $('div').append(newParData);
				    newParData = $.html();
				    newParData1 = fieldLabel+newParData;
				    $ = cheerio.load(grp);
				    $('div').append(newParData1);
				    newParData = $.html();
				    //console.log(newParData);
				    self.setNodeData(nodeIsn, newParData);
				}

				return;
			};
		});
	}

	this.init = function(appIsn){
		//Find all App Objects and set treeData
		db.boolAppObj.find({"appIsn":appIsn}).sort({_id:1},function(err, data){
			if( err || !data) console.log("No data found!");
			else {
				numNodes = 0;
				data.forEach(function(node){
					self.pushNode(String(node._id), node.objSeq, node.parentIsn, numNodes);
					self.setNodeData(String(node._id), node.baseWigCode, node.baseWigName, node.objOps, node.objWidth, node.objRow, node.objOffset, node.objName);
					numNodes++;

				});
			};
			
		});

		//$ = cheerio.load('<h2 class="title">Hello world</h2>');
		//console.log($.html());
	}

	this.render = function(){
		header = [  '<!doctype html><html lang="en"><head>',
		  '<meta charset="UTF-8">',
		  '<title>Render</title>',
		  '<link href="/stylesheets/bootstrap/css/bootstrap.min.css" rel="stylesheet">',
		  '<link href="/stylesheets/bootstrap/css/datatables.bootstrap.min.css" rel="stylesheet">',
		  '<link href="/stylesheets/styles.css" rel="stylesheet">',
		  '<script type="text/javascript" src="/javascripts/jquery.js"></script>',
		  '<script type="text/javascript" src="/javascripts/jquery.dataTables.js"></script>',
		  '<script src="/javascripts/angular.min.js"></script>',
		  '<script type="text/javascript" src="/javascripts/angular.ng-modules.js"></script>',
		  '<script type="text/javascript" src="/javascripts/angular-datatables.min.js"></script>',
		  '<script type="text/javascript" src="/javascripts/angular-datatables.bootstrap.min.js"></script>',
		  '</head><body>'
		].join('\n');

		footer = ['<script type="text/javascript" src="/stylesheets/bootstrap/js/bootstrap.min.js"></script>',
		'</body></html>'
		].join('\n');
		var newParData = 'x';
		setTimeout(function(){
		treeDepth = self.depth();
		lowLevel = self.getLevel(treeDepth-1);
		lowLevel.forEach(function(child){
			self.attrSet(child);
		});
			for (var i = treeDepth - 1; i >= 0; i--) {
				lev = self.getLevel(i);
				lev.forEach(function(child){
					self.attrSet(child);
				});
				for (var j = 0; j <= lev.length - 1; j++) {
					parent = lev[j];

					if (i != 0) {
						//console.log(self.hasChildren(parent), parent);
						if (!self.hasChildren(parent)) {
							//console.log(parent);
							sibsData = self.concatSibs(parent);
							parData  = self.getNodeData(parent);
							//setTimeout(function(){
							$ = cheerio.load(parData);
							if($('.panel').hasClass('bool-container')){
								$('.panel').html(sibsData);
							}else if($('.panel-body').hasClass('bool-container')){
								$('.bool-container').html(sibsData);
							}else if($('.panel-header').hasClass('bool-container')){
								$('.bool-container').html(sibsData);
							}else if($('.panel-footer').hasClass('bool-container')){
								$('.bool-container').html(sibsData);
							}else if($('li').hasClass('bool-container')){
								$('li').html(sibsData);
							}else if($('ul').hasClass('bool-container')){
								$('ul').html(sibsData);
							}else if($('form').hasClass('bool-container')){
								console.log(parent);
								console.log(sibsData);
								$('.bool-container').html(sibsData);
							}
							newParData = $.html();
							self.setNodeData(parent, newParData);
						}else{
							console.log("Has Children: ", parent);
						}
					//self.attrSet(parent);
					//console.log(parent);
					}else if (i == 0) {
						sibsData = self.concatSibs(parent);
						parData  = self.getNodeData(parent);
						$ = cheerio.load(parData);
						$('div').html(sibsData);
						newParData = $.html();
					    self.setNodeData(parent, newParData);
					    boolAppBody = header+newParData+footer;
					    //return newParData;
					    fs.writeFile('views/radbool.ejs', boolAppBody, 'utf8',function(err, data){
					      if (err) {
					        console.log(err);
					      };
					      //exec(printCommand);
					    });
					}
				};
	    }},300);
	}

	this.dynamicSort = function(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
      }
    }	
}

//module.exports = boolNode;
module.exports = boolTree;