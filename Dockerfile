# Container image that runs your code
FROM mcr.microsoft.com/azure-powershell:mariner-2

ARG name

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY script.ps1 /script.ps1

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/script.ps1", "name"]
