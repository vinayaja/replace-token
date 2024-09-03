import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

export async function run() {
    const token = getInput("gh-token");
    const environmentName = getInput("Environment-Name")
    const orgName = getInput("Org-Name")
    const filesPath = getInput("Filespath");
    const fileName = getInput("Filename");
    const tokenPrefix = getInput("tokenprefix") || "#{";
    const tokenSuffix = getInput("tokensuffix") || "}#";

    const fs=require('fs');
    let files_:string[] = [];

    function getFiles (dir:string){ 
        var files = fs.readdirSync(dir);
    
        for (var i in files)
        {
            var name = dir + '\\' + files[i];
            if (fs.statSync(name).isDirectory()){
                getFiles(name);
            } 
            else if(name.endsWith(fileName))
            {
            files_.push(name);
            }
        }
        return files_;
    }

    const octoKit = getOctokit(token);

    try{  
        
        interface variable {
            name: string;
            value: string;
          }
        let variables: variable[] = []

        const repoId = (await octoKit.rest.repos.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            headers: {
            'X-GitHub-Api-Version': '2022-11-28'
                }
            })).data.id
        
        // Get Repository Variables
        var pageNumber:number = 1;
        const listRepoVariablesResult = "";
        do{
            const listRepoVariablesResult = await octoKit.rest.actions.listRepoVariables({
                owner: context.repo.owner,
                repo: context.repo.repo,
                page: pageNumber,
                per_page: 30,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
            listRepoVariablesResult.data.variables.forEach((variable) =>{
                const variableName = variable.name;
                const variableValue = variable.value;            
                variables.push({ name: variableName, value: variableValue }); 
            });
            pageNumber++;
        }while(listRepoVariablesResult != "") 
        
        // Get Environment Variables
        if(environmentName != "")
        {
            var pageNumber:number = 1;
            const listEnvVariablesResult = "";
            do{
                const listEnvVariablesResult = await octoKit.rest.actions.listEnvironmentVariables({
                    repository_id: repoId,
                    environment_name: environmentName,
                    page: pageNumber,
                    per_page: 30,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                        }
                    })
                listEnvVariablesResult.data.variables.forEach((variable) =>{
                    const variableName = variable.name;
                    const variableValue = variable.value;            
                    variables.push({ name: variableName, value: variableValue }); 
                });
                pageNumber++;
            }while(listEnvVariablesResult != "") 
        }

        // Get Org Variables
        if(orgName != "")
        {
            var pageNumber:number = 1;
            const listOrgVariablesResult = "";
            do{
                const listOrgVariablesResult = await octoKit.rest.actions.listOrgVariables({
                    org: orgName,
                    page: pageNumber,
                    per_page: 30,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                        }
                    })
                listOrgVariablesResult.data.variables.forEach((variable) =>{
                const variableName = variable.name;
                const variableValue = variable.value;            
                variables.push({ name: variableName, value: variableValue }); 
                });
                pageNumber++;
            }while(listOrgVariablesResult != "") 
        }

        console.log(variables);
        
        let count:number = 0;
        const tokenizedFiles = getFiles(filesPath)
        console.log(tokenizedFiles)
        const envVariables = process.env;

        for (const tokenizedFile of tokenizedFiles) {
            console.log(`\nChecking and replacing tokens in ${tokenizedFile}`);
            let rawContent = fs.readFileSync(`${filesPath}/${tokenizedFile}`, 'utf-8');
            // Loop through each environment variable
            for (const [key, value] of Object.entries(envVariables)) {
                const matchValue = `${tokenPrefix}${key}${tokenSuffix}`;
                if (rawContent.includes(matchValue)) {
                    rawContent = rawContent.replace(new RegExp(matchValue, 'g'), value);
                    console.log(`${key} value updated in ${tokenizedFile}`);
                    count++;
                }
            }
        
            // Loop through additional variables
            for (const variable of variables) {
                const matchValue = `${tokenPrefix}${variable.name}${tokenSuffix}`;
                if (rawContent.includes(matchValue)) {
                    rawContent = rawContent.replace(new RegExp(matchValue, 'g'), variable.value);
                    console.log(`${variable.name} value updated in ${tokenizedFile}`);
                    count++;
                }
            }
        
            // Check if any tokens were replaced
            if (count > 0) {
                fs.writeFileSync(`${filesPath}/${tokenizedFile}`, rawContent);
        
                if (rawContent.includes(tokenPrefix)) {
                    console.warn(`New token found in ${tokenizedFile}, Update below variables, else functionality will fail`);
                    // Logic to display new tokens (not implemented in original PowerShell code)
                    break;
                }
            } else {
                console.log(`No tokens found in ${tokenizedFile}`);
            }
            console.log("\n#################################################################");
        }


    }   catch(error){
        setFailed((error as Error)?.message ?? "Unknown error");
    }
    
}

if(!process.env.JEST_WORKER_ID){
    run();
}