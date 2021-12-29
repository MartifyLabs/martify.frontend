var fs = require('fs');
const path = require('path/posix');

let folder_policy = "policyIDs-main/projects";
// let folder_policy = "test";

let filenames = [];
fs.readdirSync(folder_policy).forEach(file => {
  filenames.push(file)
});


function add_project(output, data){

  let project_id = data.project;
  project_id = project_id.replace(/[^0-9a-z]/gi, '')
  project_id = project_id.toLowerCase();

  if(data.policies.length>0){
    if(data.policies[0].length>10){
      let this_project = {
        "id": project_id,
        "policy_ids": data.policies,
        "meta": {
          "name": data.project
        }
      };
      if(data.tags) this_project.tags = data.tags;
    
      output[project_id] = this_project;
    }
  }
  
  return output;
}

function readfile(output, filenames, file_i){
  if(file_i==filenames.length){
    return output;
  }
  
  let path = folder_policy+"/"+filenames[file_i];

  try{
    if(!fs.lstatSync(path).isDirectory() ){

    var data = fs.readFileSync(folder_policy+"/"+filenames[file_i], 'utf8');
      if(data){
        data = JSON.parse(data.toString());
        if (Array.isArray(data)) {
          for(var i in data){
            output = add_project(output, data[i])
          }
        }else{
          output = add_project(output, data)
        }     
      }
    };
  }catch(err){
    console.log("err", path)
  }

  if(file_i<filenames.length){
    file_i = file_i+1;
    return readfile(output, filenames, file_i)
  }

}

let output = {};
output = readfile(output, filenames, 0)

let data = JSON.stringify(output);
fs.writeFileSync('collections-cnft.json', data);
