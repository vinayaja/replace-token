import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github"; 

export async function run() {
    const token = getInput("gh-token");
    const customTokenPattern = new Boolean(getInput("CustomTokenPattern"));
    const filesPath = getInput("Filespath");
    const fileName = getInput("Filename");
    
    if(!customTokenPattern)
    {
        const tokenPrefix = getInput("tokenprefix");
        const tokenSuffix = getInput("tokensuffix");
        if((tokenPrefix == "") && (tokenSuffix == ""))
        {
            throw new Error("PLease provide valid tokenPrefix or tokenPrefix; one of them is null");
        }
    }
    else{
        const tokenPrefix = "#{";
        const tokenSuffix = "}#"
    }

    const octoKit = getOctokit(token);

    try{  
        
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
                console.log(`Variable Name: ${variable.name}, Variable Value: ${variable.value}`);
            });

            pageNumber++;
        }while(listRepoVariablesResult != "")      
        

    }   catch(error){
        setFailed((error as Error)?.message ?? "Unknown error");
    }
    
}

if(!process.env.JEST_WORKER_ID){
    run();
}