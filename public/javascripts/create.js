$("document").ready(function(){
  //alert("test");

  //Panel Save action
  $("#panelSave").click(function(){
  var appIsn = 1;
  var action = "panelCreate";
  var panelId = $("#panelObjId").val();
  var panelParId = $("#panelObjParId").val();
  var panelInstWidth = $("#panelInstWidth").val();
  var panelInstOffset=$("#panelInstOffset").val();
  var panelRow = $("#panelInstRow").val();
  var panelTitle = $("#panelTitle").val();
  var panelTitleSize = $("#panelTitleSize").val();
  var panelType = $("#panelType").val();
  var panelSeq = $("#panelSeq").val();
  var hasHeaderPanel = 1;
  var hasFooterPanel = 0;
  var isModalPanel = 0;
  var test = [JSON.stringify({"test1":35, "test2":[1,2,3].join(',')})].join(',');
  //var test3 = $.parseJSON(test);
  var postArr = {test:test, action:action, appIsn:appIsn, panelSeq:panelSeq, panelType:panelType, hasHeaderPanel:hasHeaderPanel, hasFooterPanel:hasFooterPanel, isModalPanel:isModalPanel, panelId:panelId, panelParId:panelParId, panelInstWidth:panelInstWidth, panelInstOffset:panelInstOffset, panelRow:panelRow, panelTitle:panelTitle, panelTitleSize:panelTitleSize};
  JSON.stringify(postArr);

  $.post('/panelsave', postArr,
    function(data){   
      console.log(data);  
    }, "json");
  });
});