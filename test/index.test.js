'use strict';

/* eslint-disable no-underscore-dangle */
const assert = require('chai').assert;
const token = 'token';
const testParseHook = require('./data/parseHookOutput.json');

describe('index test', () => {
    let instance;
    let ScmBase;

    beforeEach(() => {
        /* eslint-disable global-require */
        ScmBase = require('../index');
        /* eslint-enable global-require */

        instance = new ScmBase({ foo: 'bar' });
    });

    afterEach(() => {
        instance = null;
    });

    it('can create an scm base class', () => {
        assert.instanceOf(instance, ScmBase);
    });

    describe('configure', () => {
        it('has a configure method', () => {
            assert.isFunction(instance.configure);
            instance.configure({});
        });
    });

    describe('parseUrl', () => {
        const config = {
            checkoutUrl: 'git@github.com:screwdriver-cd/scm-base.git',
            token: 'bar',
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.parseUrl({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._parseUrl = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.parseUrl(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.parseUrl(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('parseHook', () => {
        const headers = {
            stuff: 'foo'
        };
        const payload = {
            type: 'pr'
        };

        it('returns data from underlying method', () => {
            instance._parseHook = () => Promise.resolve(testParseHook);

            return instance.parseHook()
                .then((output) => {
                    assert.deepEqual(output, testParseHook);
                });
        });

        it('returns not implemented', () =>
            instance.parseHook(headers, payload)
                .then(() => {
                    assert.fail('This should not fail the test');
                }, (err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getChangedFiles', () => {
        const type = 'pr';
        const payload = {
            type
        };

        it('returns data from underlying method', () => {
            instance.getChangedFiles = () => Promise.resolve([
                'README.md',
                'folder/screwdriver.yaml'
            ]);

            return instance.getChangedFiles()
                .then((output) => {
                    assert.deepEqual(output, [
                        'README.md',
                        'folder/screwdriver.yaml'
                    ]);
                });
        });

        it('returns error when invalid output', () => {
            instance._getChangedFiles = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getChangedFiles({ type, payload, token })
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.getChangedFiles({ type, payload, token })
                .then(() => {
                    assert.fail('This should not fail the test');
                }, (err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getCheckoutCommand', () => {
        const config = {
            branch: 'branch',
            host: 'github.com',
            org: 'screwdriver-cd',
            repo: 'guide',
            sha: '12345',
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.getCheckoutCommand({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getCheckoutCommand = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getCheckoutCommand(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.getCheckoutCommand(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getSetupCommand', () => {
        let config;

        beforeEach(() => {
            config = {
                pipeline: {
                    scmUri: 'github.com:12344567:branch',
                    scmRepo: { name: 'screwdriver-cd/guide' },
                    scmContext: 'github:github.com'
                },
                job: {
                    permutations: [{}]
                },
                build: {
                    sha: '12345'
                }
            };
        });

        it('returns a command', () => {
            instance._getCheckoutCommand = (o) => {
                assert.deepEqual(o, {
                    branch: 'branch',
                    host: 'github.com',
                    org: 'screwdriver-cd',
                    repo: 'guide',
                    sha: '12345',
                    scmContext: 'github:github.com'
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });

        it('returns a command for pr', () => {
            instance._getCheckoutCommand = (o) => {
                assert.deepEqual(o, {
                    branch: 'branch',
                    host: 'github.com',
                    org: 'screwdriver-cd',
                    repo: 'guide',
                    sha: '12345',
                    prRef: 'abcd',
                    scmContext: 'github:github.com'
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };
            config.build.prRef = 'abcd';

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });

        it('returns a command for manifest', () => {
            instance._getCheckoutCommand = (o) => {
                assert.deepEqual(o, {
                    branch: 'branch',
                    host: 'github.com',
                    manifest: 'git@github.com:org/repo.git/default.xml',
                    org: 'screwdriver-cd',
                    repo: 'guide',
                    sha: '12345',
                    scmContext: 'github:github.com'
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };
            config.job.permutations[0] = {
                annotations: {
                    'screwdriver.cd/repoManifest': 'git@github.com:org/repo.git/default.xml'
                }
            };

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });

        it('returns a command for commit branch', () => {
            instance._getCheckoutCommand = (o) => {
                assert.deepEqual(o, {
                    branch: 'branch',
                    host: 'github.com',
                    org: 'screwdriver-cd',
                    repo: 'guide',
                    sha: '12345',
                    commitBranch: 'cm-branch',
                    scmContext: 'github:github.com'
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };
            config.build.commitBranch = 'cm-branch';

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });

        it('returns a command for parent config', () => {
            instance._getCheckoutCommand = (o) => {
                assert.deepEqual(o, {
                    branch: 'branch',
                    host: 'github.com',
                    org: 'screwdriver-cd',
                    repo: 'guide',
                    sha: '12345',
                    scmContext: 'github:github.com',
                    parentConfig: {
                        branch: 'master',
                        host: 'github.com',
                        org: 'screwdriver-cd',
                        repo: 'parent-to-guide',
                        sha: '54321'
                    }
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };
            config.configPipeline = {
                scmUri: 'github.com:12344567:master',
                scmRepo: { name: 'screwdriver-cd/parent-to-guide' },
                scmContext: 'github:github.com'
            };
            config.configPipelineSha = '54321';

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });
    });

    describe('decorateUrl', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.decorateUrl({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._decorateUrl = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.decorateUrl(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.decorateUrl(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('decorateCommit', () => {
        const config = {
            sha: '0264b13de9aa293b7abc8cf36793b6458c07af38',
            scmUri: 'github.com:repoId:branch',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.decorateCommit({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._decorateCommit = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.decorateCommit(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.decorateCommit(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('decorateAuthor', () => {
        const config = {
            username: 'd2lam',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.decorateAuthor({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._decorateAuthor = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.decorateAuthor(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.decorateAuthor(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getPermissons', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.getPermissions({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getPermissions = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getPermissions(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.getPermissions(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getOrgPermissions', () => {
        const config = {
            organization: 'screwdriver',
            token: 'token',
            username: 'foo',
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.getOrgPermissions({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getOrgPermissions = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getOrgPermissions(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.getOrgPermissions(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('getCommitSha', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.getCommitSha({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getCommitSha = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getCommitSha(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.getCommitSha(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getCommitRefSha', () => {
        const config = {
            token,
            owner: 'owner',
            repo: 'repo',
            ref: 'master'
        };

        it('returns error when invalid config object', () =>
            instance.getCommitRefSha({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getCommitRefSha = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getCommitRefSha(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.getCommitRefSha(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });
    describe('updateCommitStatus', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            sha: '0264b13de9aa293b7abc8cf36793b6458c07af38',
            buildStatus: 'SUCCESS',
            token,
            url: 'https://foo.bar',
            pipelineId: 123,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.updateCommitStatus({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._updateCommitStatus = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.updateCommitStatus(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.updateCommitStatus(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('stats', () => {
        it('returns empty object', () => {
            assert.deepEqual(instance.stats(), {});
        });
    });

    describe('getFile', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            path: 'testFile',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid config object', () =>
            instance.getFile({})
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getFile = () => Promise.resolve({
                invalid: 'object'
            });

            return instance.getFile(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'AssertionError');
                });
        });

        it('returns not implemented', () =>
            instance.getFile(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getOpenedPRs', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid input', () =>
            instance.getOpenedPRs({})
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getOpenedPRs = () => Promise.resolve({
                invalid: 'stuff'
            });

            return instance.getOpenedPRs(config)
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.getOpenedPRs(config)
                .then(assert.fail, (err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );

        it('returns job list when no errors', () => {
            instance._getOpenedPRs = () => Promise.resolve([{
                name: 'PR-1',
                ref: 'pull/1/merge',
                title: 'Test ref abc',
                username: 'janedoe',
                createTime: '2018-10-10T21:35:31Z',
                url: 'https://example.com/pr-1',
                userProfile: 'https://example.com/janedoe'
            }]);

            return instance.getOpenedPRs(config).then(
                jobs => assert.deepEqual(jobs, [{
                    name: 'PR-1',
                    ref: 'pull/1/merge',
                    title: 'Test ref abc',
                    username: 'janedoe',
                    createTime: '2018-10-10T21:35:31Z',
                    url: 'https://example.com/pr-1',
                    userProfile: 'https://example.com/janedoe'
                }]),
                assert.fail);
        });
    });

    describe('getBellConfiguration', () => {
        it('returns data from underlying method', () => {
            instance._getBellConfiguration = () => Promise.resolve({
                real: 'config'
            });

            return instance.getBellConfiguration()
                .then((output) => {
                    assert.deepEqual(output, {
                        real: 'config'
                    });
                });
        });

        it('returns not implemented', () =>
            instance.getBellConfiguration()
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('addWebhook', () => {
        const config = {
            scmUri: 'github.com:20161206:branch',
            token,
            webhookUrl: 'https://bob.by/ford',
            scmContext: 'github:github.com'
        };

        it('returns data from underlying method', () => {
            const expectedOutput = 'whenYourOpponentIsProgrammedToLose';

            instance._addWebhook = () => Promise.resolve(expectedOutput);

            return instance.addWebhook({
                scmUri: 'github.com:20161206:branch',
                token,
                webhookUrl: 'https://bob.by/ford',
                scmContext: 'github:github.com'
            }).then((result) => {
                assert.strictEqual(result, expectedOutput);
            });
        });

        it('rejects when given an invalid config object', () =>
            instance.addWebhook({})
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('rejects when not implemented', () =>
            instance.addWebhook(config)
                .then(assert.fail, (err) => {
                    assert.strictEqual(err.message, 'Not implemented');
                })
        );
    });

    describe('getPrInfo', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            prNum: 123,
            scmContext: 'github:github.com'
        };

        it('returns error when invalid input', () =>
            instance.getPrInfo({})
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._getPrInfo = () => Promise.resolve({
                invalid: 'stuff'
            });

            return instance.getPrInfo(config)
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () =>
            instance.getPrInfo(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('addPrComment', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token,
            prNum: 123,
            comment: 'my, what a fine PR',
            scmContext: 'github:github.com'
        };

        it('returns error when invalid input', () =>
            instance.addPrComment({})
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('returns error when invalid output', () => {
            instance._addPrComment = () => Promise.resolve({
                invalid: 'stuff'
            });

            return instance.addPrComment(config)
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns null if not implemented', () =>
            instance.addPrComment(config)
                .then((result) => {
                    assert.isNull(result);
                })
        );
    });

    describe('getScmContexts', () => {
        it('returns error when invalid output', () => {
            instance._getScmContexts = () => 'invalid';

            const result = instance.getScmContexts();

            assert.instanceOf(result, Error);
            assert.equal(result.name, 'ValidationError');
        });

        it('returns not implemented', () => {
            try {
                instance.getScmContexts();
            } catch (err) {
                assert.equal(err.message, 'Not implemented');
            }
        });
    });

    describe('canHandleWebhook', () => {
        const headers = {
            stuff: 'foo'
        };
        const payload = {
            moreStuff: 'bar'
        };

        it('returns data from underlying method', () => {
            instance._canHandleWebhook = () => Promise.resolve({
                type: 'pr'
            });

            return instance.canHandleWebhook()
                .then((output) => {
                    assert.deepEqual(output, {
                        type: 'pr'
                    });
                });
        });

        it('returns not implemented', () =>
            instance.canHandleWebhook(headers, payload)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err.message, 'Not implemented');
                })
        );
    });

    describe('getDisplayName', () => {
        const config = {
            displayName: 'github.com'
        };

        beforeEach(() => {
            instance.configure(config);
        });

        it('returns empty display name if no configuration', () => {
            instance.configure({});
            assert.equal(instance.getDisplayName(), '');
        });

        it('returns valid display name', () => {
            assert.equal(instance.getDisplayName(), 'github.com');
        });
    });

    describe('getBranchList', () => {
        const config = {
            scmUri: 'github.com:20180525:branch',
            token
        };

        it('returns data from underlying method', () => {
            instance._getBranchList = () => Promise.resolve({
                real: 'config'
            });

            return instance.getBranchList(config)
                .then((output) => {
                    assert.deepEqual(output, {
                        real: 'config'
                    });
                });
        });

        it('rejects when given an invalid config object', () =>
            instance.getBranchList({})
                .then(assert.fail, (err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                })
        );

        it('rejects when not implemented', () =>
            instance.getBranchList(config)
                .then(assert.fail, (err) => {
                    assert.strictEqual(err.message, 'Not implemented');
                })
        );
    });
});
