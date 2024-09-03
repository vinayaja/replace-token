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
     
        console.log(variables);

    }   catch(error){
        setFailed((error as Error)?.message ?? "Unknown error");
    }
    
}

if(!process.env.JEST_WORKER_ID){
    run();
}