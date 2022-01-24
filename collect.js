const fetch = require('node-fetch');
const fs = require('fs');
const _ = require('underscore');
const BEARER_TOKEN = process.env.TM_TOKEN || '';
const TENANT = process.env.TM_TENANT || '';

console.log("Id,LastModifiedByName,LastModifiedDate,Name,ThreatNumber,Mitigated,Open,Very High, High, Medium, Low, Very Low");
get_projects().then(res => {
let projects = res.Data.Data;
let csl_projects = projects
	//filter(p => p.CreatedByName.includes("Jiang Fan") || p.LastModifiedByName.includes("Jiang Fan"))
let csl_fetches = csl_projects
	.map(p=>get_threats(p.Id));

Promise.all(csl_fetches).then(responses => {
  for (i in csl_projects){
    let p = csl_projects[i];  
    let group_by_risk = _.groupBy(responses[i].Data,"ActualRiskName");
    let group_by_status = _.groupBy(responses[i].Data,"StatusName");
    console.log(p.Id 
	    + "," + p.LastModifiedByName 
	    + "," + p.LastModifiedDate 
	    + "," + p.Name 
	    + "," + responses[i].Data.length
	    + "," + optlength(group_by_status,"Mitigated")
	    + "," + optlength(group_by_status,"Open")
	    + "," + optlength(group_by_risk,"Very High")
	    + "," + optlength(group_by_risk,"High")
	    + "," + optlength(group_by_risk,"Medium")
	    + "," + optlength(group_by_risk,"Low")
	    + "," + optlength(group_by_risk,"Very Low"));
  }
})
})
function optlength(v,p){
  return (v[p])?v[p].length:0;
}
function get_projects(){
  res = fetch("https://"+TENANT+".threatmodeler.net/api/projects/smartfilter", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en",
      "authorization": "Bearer " + BEARER_TOKEN,
      "content-type": "application/json",
    },
    "body": "{\"virtualGridStateRequestModel\":{\"state\":{\"skip\":0,\"take\":300}},\"projectFilterModel\":{\"ActiveProjects\":true}}",
    "method": "POST"
  }).then(res => res.json())
  return res;
}
function get_threats(project_id){
  return fetch("https://"+TENANT+".threatmodeler.net/api/project/"+project_id+"/threats/false", {
    "headers": {
      "accept": "application/json",
      "authorization": "Bearer " + BEARER_TOKEN,
      "content-type": "application/json",
    },
    "body": null,
    "method": "GET"
  }).then(res => res.json())
}
