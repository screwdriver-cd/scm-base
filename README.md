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
    action: 'opened',   // can be 'opened', 'closed', or 'synchronized' for type 'pr'; 'push' for type 'repo'
    username: 'batman',
    checkoutUrl: 'https://batman@bitbucket.org/batman/test.git',
    branch: 'mynewbranch',
    sha: '40171b678527',
    prNum: 3,
    prRef: 'refs/pull-requests/3/from'
}
```

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
| config.sha     | String | Commit sha to decorate |
| config.scmUri        | String | Scm uri (ex: `github.com:1234:branchName`) |
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
| config.username     | String | Author to decorate |
| config.token | String | Access token for scm |

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
| config        | Object | true | Configuration Object |
| config.scmUri | String | true | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | true | Access token for scm |
| config.sha | String | true | The scm sha to update a status for |
| config.buildStatus | String | true | The screwdriver build status to translate into scm commit status |
| config.url | String | false | The target url for setting up details |

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
| config.scmUri | String | true | The scm uri (ex: `github.com:1234:branchName`) |
| config.token | String | true | Access token for scm |
| config.path | String | true | The path to the file on scm to read |
| config.ref | String | false | The reference to the scm repo, could be a branch or sha |

#### Expected Outcome
The contents of the file at `path` in the repository

#### Expected Promise Response
1. Resolve with the contents of `path`
2. Reject if the `path` cannot be downloaded, decoded, or is not a file

## Extending
To make use of the validation functions, the functions to override are:

1. `_parseUrl`
1. `_parseHook`
1. `_decorateUrl`
1. `_decorateCommit`
1. `_decorateAuthor`
1. `_getPermissions`
1. `_getCommitSha`
1. `_updateCommitStatus`
1. `_getFile`
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
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/scm-base.svg
[issues-url]: https://github.com/screwdriver-cd/scm-base/issues
[status-image]: https://cd.screwdriver.cd/pipelines/5c780cf3059eadfed0c60c0dd0194146105ae46c/badge
[status-url]: https://cd.screwdriver.cd/pipelines/5c780cf3059eadfed0c60c0dd0194146105ae46c
[daviddm-image]: https://david-dm.org/screwdriver-cd/scm-base.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/screwdriver-cd/scm-base
