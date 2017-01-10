# Scm Base
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] ![License][license-image]

> Base class for defining the behavior between screwdriver and source control management systems

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

#### Expected Outcome

Update the repository with the desired webhook configuration.

#### Expected Promise response

1. Resolves when the webhook is correctly attached to the repository
1. Rejects when the repository was unable to be updated with the webhook configuration

### parseUrl
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config             | Object | Configuration Object |
| config.checkoutUrl | String | Checkout url for a repo to parse |
| config.token  | String | Access token for scm |

#### Expected Outcome
An scmUri (ex: `github.com:1234:branchName`, where 1234 is a repo ID number), which will be a unique identifier for the repo and branch in Screwdriver.

#### Expected Promise response
1. Resolve with an scm uri for the repository
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
    type: 'pr',         // can be 'pr' or 'repo'
    hookId: '81e6bd80-9a2c-11e6-939d-beaa5d9adaf3', // webhook event uuid
    action: 'opened',   // can be 'opened', 'reopened', 'closed', or 'synchronized' for type 'pr'; 'push' for type 'repo'
    username: 'robin',  // should be the actor/creator of the webhook event (not necessarily the author)
    checkoutUrl: 'https://batman@bitbucket.org/batman/test.git',
    branch: 'mynewbranch',
    sha: '9ff49b2d1437567cad2b5fed7a0706472131e927',
    prNum: 3,
    prRef: 'pull/3/merge'
}
```

#### Expected Promise response
1. Resolve with a parsed hook object
2. Reject if not able to parse hook

### getCheckoutCommand
Required parameters:

| Parameter        | Type  | Required |  Description |
| :-------------   | :---- | :--------| :---- |
| config        | Object | Yes | Configuration Object |
| config.branch | String | Yes | Pipeline branch |
| config.host | String | Yes | Scm host (ex: github.com) |
| config.org | String | Yes | Scm org (ex: screwdriver-cd) |
| config.prRef | String | No | PR branch or reference |
| config.repo | String | Yes | Scm repo (ex: guide) |
| config.sha | String | Yes | Scm sha |

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
| config.build | Object | Yes | build config with sha and possibly prRef |

### decorateUrl
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri | String | Scm uri (ex: `github.com:1234:branchName`) |
| config.token  | String | Access token for scm |

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

### getCommitSha
Required parameters:

| Parameter        | Type  |  Description |
| :-------------   | :---- | :-------------|
| config        | Object | Configuration Object |
| config.scmUri | String | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | Access token for scm |

#### Expected Outcome
The commit sha for a given branch on a repository.

#### Expected Promise response
1. Resolve with a commit sha string for the given `scmUri`
2. Reject if not able to get a sha

### updateCommitStatus
The parameters required are:

| Parameter        | Type  | Required | Description |
| :-------------   | :---- | :------- | :-------------|
| config        | Object | Yes | Configuration Object |
| config.buildStatus | String | Yes | The screwdriver build status to translate into scm commit status |
| config.jobName | String | No | Optional name of the job that finished |
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
| config        | Object | true | Configuration Object |
| config.path | String | true | The path to the file on scm to read |
| config.ref | String | false | The reference to the scm repo, could be a branch or sha |
| config.scmUri | String | true | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | true | Access token for scm |

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
| config        | Object | true | Configuration Object |
| config.scmUri | String | true | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | true | Access token for scm |

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


## Extending
To make use of the validation functions, the functions to override are:

1. `_addWebhook`
1. `_parseUrl`
1. `_parseHook`
1. `_getCheckoutCommand`
1. `_decorateUrl`
1. `_decorateCommit`
1. `_decorateAuthor`
1. `_getPermissions`
1. `_getCommitSha`
1. `_updateCommitStatus`
1. `_getFile`
1. `_getBellConfiguration`
1. `stats` 

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
[daviddm-image]: https://david-dm.org/screwdriver-cd/scm-base.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/screwdriver-cd/scm-base
[bell]: https://www.npmjs.com/package/bell
