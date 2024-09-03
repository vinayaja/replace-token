import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

export async function run() {
    const token = getInput("gh-token");
    const customTokenPattern = new Boolean(getInput("CustomTokenPattern"));
    const environmentName = getInput("Environment-Name")
    const filesPath = getInput("Filespath");
    const fileName = getInput("Filename");
    
    if(!customTokenPattern)
    {
        const tokenPrefix = getInput("tokenprefix");
        const tokenSuffix = getInput("tokensuffix");
        if((tokenPrefix == "") && (tokenSuffix == ""))
        {
            throw new Error("Please provide valid tokenPrefix or tokenPrefix; one of them is null");
        }
    }
    else{
        const tokenPrefix = "#{";
        const tokenSuffix = "}#"
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
        const orgName =  (await octoKit.rest.orgs.get({
            org: context.repo.owner,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
                }
            })).data.name

        if(orgName != undefined)
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

    }   catch(error){
        setFailed((error as Error)?.message ?? "Unknown error");
    }
    
}

if(!process.env.JEST_WORKER_ID){
    run();
}