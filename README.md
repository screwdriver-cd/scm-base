# Scm Base
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] ![License][license-image]

> Base class for defining the behavior between Screwdriver and source control management (SCM) systems

## Usage

```bash
npm install screwdriver-scm-base
```

## Interface
This is a promise based interface for interacting with a source control management system

### configure
The `configure` function takes in an object and resets the configuration values

### addWebhook
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config            | Object | Configuration Object |
| config.scmUri     | String | SCM URI to add the webhook to (e.g., "github.com:8888:branchName" |
| config.token      | String | Access token for SCM |
| config.webhookUrl | String | The URL to use for webhook notifications |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome

Update the repository with the desired webhook configuration.

#### Expected Promise response

1. Resolves when the webhook is correctly attached to the repository
1. Rejects when the repository was unable to be updated with the webhook configuration

### addDeployKey
Required parameters:

| Parameter              | Type  |  Description |
| :-------------         | :---- | :-------------|
| config                 | Object | Configuration Object |
| config.checkoutUrl     | String | Checkout url for a repo to parse |
| config.token           | String | Access token for SCM |
| config.scmContext      | String | (optional) The name of scm context |

#### Expected Outcome

Add deploy public key counterpart to the repository.

#### Expected Promise response

1. Resolves when the deploy key is successfully generated and added
1. Rejects when the deploy key fails to generate or add

### autoDeployKeyGenerationEnabled
Required parameters:

| Parameter              | Type  |  Description |
| :-------------         | :---- | :-------------|
| config                 | Object | Configuration Object |
| config.scmContext      | String | (optional) The name of scm context |

#### Expected Outcome

Returns whether auto deploy key generation is enabled or not.

#### Expected Promise response

1. Resolves to true/false corresponding to the flag status

### parseUrl
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config             | Object | Configuration Object |
| config.checkoutUrl | String | Checkout url for a repo to parse |
| config.rootDir | String | (optional) Root directory where source code lives (ex: src/app/component) |
| config.scmContext | String | (optional) The name of scm context |
| config.token  | String | Access token for scm |

#### Expected Outcome
An scmUri (ex: `github.com:1234:branchName`, where 1234 is a repo ID number), which will be a unique identifier for the repo and branch in Screwdriver.

#### Expected Promise response
1. Resolve with an scm uri for the repository (e.g.: github.com:12345:master or github.com:12345:master:src/app/component)
2. Reject if not able to parse url

### parseHook
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| headers        | Object | The request headers associated with the webhook payload |
| payload        | Object | The webhook payload received from the SCM service |

#### Expected Outcome
A key-map of data related to the received payload in the form of:
```js
{
    action: 'opened',   // can be 'opened', 'reopened', 'closed', or 'synchronized' for type 'pr'; 'push' for type 'repo'
    branch: 'mynewbranch',
    checkoutUrl: 'https://batman@bitbucket.org/batman/test.git',
    hookId: '81e6bd80-9a2c-11e6-939d-beaa5d9adaf3', // webhook event uuid
    lastCommitMessage: 'This is the last commit message', // get a message of the last one from commits object
    prNum: 3,
    prRef: 'pull/3/merge',
    prSource: 'fork', // If type is 'pr', prSource is 'fork' or 'branch'
    scmContext: 'github:github.com',
    sha: '9ff49b2d1437567cad2b5fed7a0706472131e927',
    type: 'pr',         // can be 'pr' or 'repo'
    username: 'robin'  // should be the actor/creator of the webhook event (not necessarily the author)
}
```

#### Expected Promise response
1. Resolve with a parsed hook object
2. Reject if not able to parse hook

### getChangedFiles
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config         | Object | Yes | Configuration Object |
| config.type    | String | The type of action from Git (can be 'pr' or 'repo') |
| config.payload | Object | The webhook payload received from the SCM service |
| config.token   | String | Access token for scm |

#### Expected Outcome
An array of file paths that were changed:
```js
['README.md', 'folder/screwdriver.yaml'] // array of changed files
```

#### Expected Promise response
1. Resolve with an array of files
2. Reject if not able to parse hook

### getCheckoutCommand
Required parameters:

| Parameter        | Type  | Required |  Description |
| :-------------   | :---- | :--------| :---- |
| config        | Object | Yes | Configuration Object |
| config.branch | String | Yes | Pipeline branch |
| config.host | String | Yes | Scm host (ex: github.com) |
| config.manifest | String | No | Repo Manifest URL |
| config.org | String | Yes | Scm org (ex: screwdriver-cd) |
| config.prRef | String | No | PR branch or reference |
| config.repo | String | Yes | Scm repo (ex: guide) |
| config.rootDir | String | No | Root directory where source code lives (ex: src/app/component) |
| config.sha | String | Yes | Scm sha |
| config.scmContext | String | No | The name of scm context |

#### Expected Outcome
Checkout command in the form of:
```js
{
    name: 'sd-checkout-code', // must be 'sd-checkout-code' exactly
    command: 'git clone https://github.com/screwdriver-cd/guide'
}
```

#### Expected Promise response
1. Resolve with a checkout command object for the repository
2. Reject if not able to get checkout command

### getSetupCommand
Internally calls getCheckoutCommand to get just the checkout command for a build, given a pipeline model and build configuration.

Required Parameters:

| Parameter        | Type  | Required |  Description |
| :-------------   | :---- | :--------| :---- |
| config        | Object | Yes | Configuration Object |
| config.pipeline | PipelineModel | Yes | Pipeline model |
| config.job | Object | Yes |Job config with repoManifest annotation
| config.build | Object | Yes | Build config with sha and possibly prRef |

### decorateUrl
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri | String | Scm uri (ex: `github.com:1234:branchName`) |
| config.token  | String | Access token for scm |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
Decorated url in the form of:
```js
{
    url: 'https://github.com/screwdriver-cd/scm-base',
    name: 'screwdriver-cd/scm-base',
    branch: 'branchName'
}
```

#### Expected Promise response
1. Resolve with a decorated url object for the repository
2. Reject if not able to get decorate url

### decorateCommit
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri        | String | Scm uri (ex: `github.com:1234:branchName`) |
| config.sha     | String | Commit sha to decorate |
| config.token | String | Access token for scm |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
Decorated commit in the form of:
```js
{
    url: 'https://github.com/screwdriver-cd/scm-base/commit/5c3b2cc64ee4bdab73e44c394ad1f92208441411',
    message: 'Use screwdriver to publish',
    author: {
        url: 'https://github.com/d2lam',
        name: 'Dao Lam',
        username: 'd2lam',
        avatar: 'https://avatars3.githubusercontent.com/u/3401924?v=3&s=400'
    }
}
```

#### Expected Promise response
1. Resolve with a decorate commit object for the repository
2. Reject if not able to decorate commit

### decorateAuthor
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.token | String | Access token for scm |
| config.username     | String | Author to decorate |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
Decorated author in the form of:
```js
{
    url: 'https://github.com/d2lam',
    name: 'Dao Lam',
    username: 'd2lam',
    avatar: 'https://avatars3.githubusercontent.com/u/3401924?v=3&s=400'
}
```

#### Expected Promise response
1. Resolve with a decorate author object for the repository
2. Reject if not able to decorate author

### getPermissions
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri | String | The scm uri to get permissions on (ex: `github.com:1234:branchName`) |
| config.token | String | Access token for scm |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
Permissions for a given token on a repository in the form of:
```js
{
    admin: true,
    push: true,
    pull: true
}
```

#### Expected Promise response
1. Resolve with a permissions object for the repository
2. Reject if not able to get permissions

### getOrgPermissions
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.organization | String | The scm organization to get permissions on (ex: `screwdriver-cd`) |
| config.username | String | The user to get permissions on (ex: `foo`) |
| config.token | String | Access token for scm |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
Permissions for a given user on a organization in the form of:
```js
{
    admin: false,
    member: true
}
```

#### Expected Promise response
1. Resolve with a permissions object for the organization
2. Reject if not able to get permissions

### getCommitSha
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri | String | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Access token for scm |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
The commit sha for a given branch on a repository.

#### Expected Promise response
1. Resolve with a commit sha string for the given `scmUri`
2. Reject if not able to get a sha

### getCommitRefSha
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.token | String | Access token for scm |
| config.owner | String | Owner of target repository |
| config.repo | String | Target repository |
| config.ref | String | Reference of the commit |
| config.scmContext | String | (optional) The name of scm context |

#### Expected Outcome
The commit sha for a ref on a repository.

#### Expected Promise response
1. Resolve with a commit sha string for the given `owner`, `repo` and `ref`
2. Reject if not able to get a sha

### updateCommitStatus
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.buildStatus | String | Yes | The screwdriver build status to translate into scm commit status |
| config.context | String | No | The status context |
| config.description | String | No | The status description |
| config.jobName | String | No | Optional name of the job that finished |
| config.pipelineId | Number | No | The pipeline id |
| config.scmContext | String | No | The name of scm context |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.sha | String | Yes | The scm sha to update a status for |
| config.token | String | Yes | Access token for scm |
| config.url | String | No | The target url for setting up details |

#### Expected Outcome
Update the commit status for a given repository and sha.

#### Expected Promise Response
1. Resolve when the commit status was updated
2. Reject if the commit status fails to update

### getFile
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.path | String | Yes | The path to the file on scm to read |
| config.ref | String | No | The reference to the scm repo, could be a branch or sha |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Yes | Access token for scm |
| config.scmContext | String | No | The name of scm context |

#### Expected Outcome
The contents of the file at `path` in the repository

#### Expected Promise Response
1. Resolve with the contents of `path`
2. Reject if the `path` cannot be downloaded, decoded, or is not a file

### getBellConfiguration

#### Expected Outcome
A configuration that can be passed to the [bell][bell] OAuth module to authenticate users.

#### Expected Promise Response
1. Resolve with a valid [bell][bell] configuration

### getOpenedPRs
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Yes | Access token for scm |
| config.scmContext | String | No | The name of scm context |

#### Expected Outcome
The list of objects consist of PR names and refs (either a branch or a sha) for the pipeline. For example:
```
[{
  name: 'PR-5',
  ref: '73675432e1288f67332af3ecd0155cf455af1492'
}, {
  name: 'PR-6',
  ref: 'dfbbc032fa331a95ee5107d1f16e9ff5f7c9d2fa'
}]
```
#### Expected Promise Response
1. Resolve with the list of objects consists of PR names and refs
2. Reject if the input or output is not valid

### getPrInfo
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Yes | Access token for scm |
| config.prNum | Integer | Yes | The PR number used to fetch the PR |
| config.scmContext | String | No | The name of scm context |

#### Expected Outcome
The object consists of PR name, sha, ref, and url for the pipeline.

#### Expected Promise Response
1. Resolve with the object consists of PR name, sha, ref, and url
2. Reject if the input or output is not valid

### addPrComment
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Yes | Access token for scm |
| config.prNum | Integer | Yes | The PR number used to fetch the PR |
| config.comment | String | Yes | The PR comment |
| config.scmContext | String | No | The name of scm context |

#### Expected Outcome
The object consisting of PR comment ID, create time, and username.

#### Expected Promise Response
1. Resolve with the object consists of PR comment ID, create time, and username
2. Reject if the input or output is not valid

### getScmContexts
No parameters are required.

#### Expected Outcome
The array of scm context names (e.g. [github:github.com, gitlab:my-gitlab])

#### Expected Response
1. The array of scm context names

### getScmContext
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.hostname | String | Yes | The scm host name (ex: `github.com`) |

#### Expected Outcome
The matching scm context name string (e.g. github:github.com)

#### Expected Response
1. The matching scm context name

### canHandleWebhook
The parameters required are:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| headers        | Object | The request headers associated with the webhook payload |
| payload        | Object | The webhook payload received from the SCM service |

#### Expected Outcome
The received webhook is available or not as boolean.

#### Expected Promise Response
1. Resolve with the received webhook is available or not.
2. Reject if the input or output is not valid

### getBranchList
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.scmUri | String | Yes | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Yes | Access token for scm |

#### Expected Outcome
The array of objects consisting of branch names.

#### Expected Promise Response
1. Resolve with an array of objects consisting of branch names.

### getDisplayName (overriding needs only the case of `scm-router`)
The parameters required are:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| scmContext        | String | The name of scm context |

#### Expected Outcome
The display name of scm context

#### Expected Response
1. The display name of scm context

### getReadOnlyInfo (overriding needs only the case of `scm-router`)
The parameters required are:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| scmContext        | String | The name of scm context |

#### Expected Outcome
Read-only SCM config

#### Expected Response
1. Read-only SCM config

### openPr
| Parameter          | Type  | Required | Description |
| :-------------     | :---- | :------- | :-------------|
| config             | Object | Yes | Configuration Object |
| config.checkoutUrl | String | Yes | Checkout url for a repo|
| config.token       | String | Yes | Access token for scm |
| config.title       | String | Yes | Pull request title   |
| config.message     | String | Yes | Pull request message |

#### Expected Outcome
An object containing information of new pull request

#### Expected Response
1. Pull request object

## Extending
To make use of the validation functions, the functions to override are:

1. `_addWebhook`
1. `_addDeployKey`
1. `_autoDeployKeyGenerationEnabled`
1. `_parseUrl`
1. `_parseHook`
1. `_getChangedFiles`
1. `_getCheckoutCommand`
1. `_decorateUrl`
1. `_decorateCommit`
1. `_decorateAuthor`
1. `_getPermissions`
1. `_getOrgPermissions`
1. `_getCommitSha`
1. `_addPrComment`
1. `_updateCommitStatus`
1. `_getFile`
1. `_getOpenedPRs`
1. `_getBellConfiguration`
1. `_getPrInfo`
1. `stats` 
1. `_getScmContexts`
1. `_getScmContext`
1. `_canHandleWebhook` 
1. `_getBranchList`
1. `_openPr`
1. `getDisplayName` (overriding needs only the case of `scm-router`)
1. `getReadOnlyInfo` (overriding needs only the case of `scm-router`) 


```js
class MyScm extends ScmBase {
    // Implement the interface
    _getFile(config) {
        // do stuff here to lookup scmUri
        return Promise.resolve('these are contents that are gotten')
    }
}

const scm = new MyScm({});
scm.getFile({
    scmUri: 'github.com:12345:master',
    path: 'screwdriver.yaml',
    token: 'abcdefg'
}).then(data => {
    // do something...
});
```

## Testing

```bash
npm test
```

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.

[npm-image]: https://img.shields.io/npm/v/screwdriver-scm-base.svg
[npm-url]: https://npmjs.org/package/screwdriver-scm-base
[downloads-image]: https://img.shields.io/npm/dt/screwdriver-scm-base.svg
[license-image]: https://img.shields.io/npm/l/screwdriver-scm-base.svg
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/screwdriver.svg
[issues-url]: https://github.com/screwdriver-cd/screwdriver/issues
[status-image]: https://cd.screwdriver.cd/pipelines/10/badge
[status-url]: https://cd.screwdriver.cd/pipelines/10
[bell]: https://www.npmjs.com/package/bell
