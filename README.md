# push-workflow

### Sample workflow to push deployment or workflow run in same repo

```yaml
# File: .github/workflows/workflow.yml

on: push

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    # checkout the repo
    - name: 'Checkout Github Action' 
      uses: actions/checkout@4

    - name: Setup Node
      uses: actions/setup-node@v1
      with:
        node-version: '20'

    - name: 'Run workflow'
      uses: vinayaja/push-workflow@v1.1.0
      with:
        gh-token: ${{ github.token }}
        run-id: "xxxxxxxxxx"
        payload: '{"env": "<env>"}'


### Sample workflow to push deployment or workflow run in same repo

```yaml
# File: .github/workflows/workflow.yml

on: push

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    # checkout the repo
    - name: 'Checkout Github Action' 
      uses: actions/checkout@4

    - name: Setup Node
      uses: actions/setup-node@v1
      with:
        node-version: '20'

    - name: 'Run workflow'
      uses: vinayaja/push-workflow@1.1.0
      with:
        gh-token: ${{ secrets.PAT_TOKEN }} # PAT token is required to access remore repo actions
        run-id: "xxxxxxxxx"
        payload: '{}'
        remote-branch: 'branch name'
        remote-repo: 'owner/repository'