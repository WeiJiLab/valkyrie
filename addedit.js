const fetch = require('node-fetch');
const fs = require('fs');
const BEARER_TOKEN = process.env.TM_TOKEN || "";
const TENANT = process.env.TM_TENANT || "";

function risklevel(risk){
  switch (risk) {
    case 'Very High':
      return "1";
    case 'High':
      return "2";
    case 'Medium':
      return "3";
    case 'Low':
      return "4";
    case 'Very Low':
      return "5";
    default:
      return "5";
  }
}

let rawdata = fs.readFileSync('threats.json');
let threats = JSON.parse(rawdata);
for (i in threats){
  if(i > 10){break;};
  let t = threats[i];
  let model = {
    "ImagePath":"/ComponentImage/DefaultComponent.jpg",
    "ComponentTypeId":85,
    "RiskId": risklevel(t["Typical_Severity"]),
    "CodeTypeId":1,
    "DataClassificationId":1,
    "Name": t["-Name"],
    "Labels":"\t\t CAPEC-"+t["-ID"],
    "LibrayId":10,
    "Description":t["Description"],
    "IsCopy":false
  }
  console.log(JSON.stringify(model))
  let th = {
    "LibraryId":10,
    "EntityType": "Threats",
    "Model": JSON.stringify(model)
  }
  console.log(JSON.stringify(th))
  create(th);
}
function create(th){
  res = fetch("https://"+TM_TENANT+".threatmodeler.net/api/threatframework/master/addedit", {
    "headers": {
      "accept": "application/json",
      "authorization": "Bearer " + BEARER_TOKEN,
      "content-type": "application/json",
    },
    "body": JSON.stringify(th),
    "method": "POST",
    "mode": "cors"
  }).then(res => res.json()).then(res => console.log(res))
}
/*
*/
