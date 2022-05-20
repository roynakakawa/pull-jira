function callJira(url){
  var jiraURL = "https://COMPANY-NAME.atlassian.net"
  var usr = "john@example.com";
  var pass = "xxxJIRATOKENxxxx";
  var userCred = "Basic " + Utilities.base64Encode(usr+":"+pass);
  var headers = {contentType: "application/json", headers: {"Authorization": userCred}, muteHttpExceptions : true}; 
  var httprsp = UrlFetchApp.fetch(jiraURL+url,headers);
  if (httprsp.getResponseCode() != 200) {Browser.msgBox("Bad response", Browser.Buttons.OK); return;}
  var resp = JSON.parse(httprsp.getContentText());
  return resp;
}

function getJiraInfo(){
var epicsKeys = [];
var epicsInfo = [];
var epicsArray = [];
var sheet = SpreadsheetApp.getActiveSheet();
var boardID = sheet.getRange(4, 7).getValue(); 
var projectInfo = callJira("/rest/agile/1.0/board/" + boardID);
var epicList = callJira("/rest/agile/1.0/board/" + boardID + "/epic");
for(var i in epicList.values){
  var eKeys = epicList.values[i].key;
  epicsKeys.push(eKeys);
}
var epicsInfo = callJira("/rest/api/2/search?fields=customfield_10015,summary,duedate,status&jql=key in ("+epicsKeys+")");
for (var i in epicsInfo.issues){
  var key = epicsInfo.issues[i].key;
  var summary = epicsInfo.issues[i].fields.summary;
  var duedate = epicsInfo.issues[i].fields.duedate;
  var startdate = epicsInfo.issues[i].fields.customfield_10015;

  epicsArray.push([key,summary,startdate,duedate]);
}
sheet.getRange(1,3).setValue(projectInfo.location.projectName);
sheet.getRange(2,3).setValue(projectInfo.location.projectId);
sheet.getRange(3,3).setValue(epicsInfo.total);
sheet.getRange(6,1,epicsArray.length,4).setValues(epicsArray);
}
