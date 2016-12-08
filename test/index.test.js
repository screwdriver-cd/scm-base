'use strict';

/* eslint-disable no-underscore-dangle */
const assert = require('chai').assert;

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
            token: 'bar'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('parseHook', () => {
        const headers = {
            stuff: 'foo'
        };
        const payload = {
            moreStuff: 'bar'
        };

        it('returns data from underlying method', () => {
            instance._parseHook = () => Promise.resolve({
                type: 'pr'
            });

            return instance.parseHook()
                .then((output) => {
                    assert.deepEqual(output, {
                        type: 'pr'
                    });
                });
        });

        it('returns not implemented', () =>
            instance.parseHook(headers, payload)
                .then(() => {
                    assert.fail('This should not fail the test');
                }, (err) => {
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('getCheckoutCommand', () => {
        const config = {
            branch: 'branch',
            host: 'github.com',
            org: 'screwdriver-cd',
            repo: 'guide',
            sha: '12345'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('getSetupCommand', () => {
        let config;

        beforeEach(() => {
            config = {
                pipeline: {
                    scmUri: 'github.com:12344567:branch',
                    scmRepo: { name: 'screwdriver-cd/guide' }
                },
                job: {},
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
                    sha: '12345'
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
                    prRef: 'abcd'
                });

                return Promise.resolve({ name: 'sd-checkout-code', command: 'stuff' });
            };
            config.build.prRef = 'abcd';

            return instance.getSetupCommand(config)
                .then((command) => {
                    assert.equal(command, 'stuff');
                });
        });
    });

    describe('decorateUrl', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('decorateCommit', () => {
        const config = {
            sha: '0264b13de9aa293b7abc8cf36793b6458c07af38',
            scmUri: 'github.com:repoId:branch',
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('decorateAuthor', () => {
        const config = {
            username: 'd2lam',
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('getPermissons', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('getCommitSha', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('updateCommitStatus', () => {
        const config = {
            scmUri: 'github.com:repoId:branch',
            sha: '0264b13de9aa293b7abc8cf36793b6458c07af38',
            buildStatus: 'SUCCESS',
            token: 'token',
            url: 'https://foo.bar'
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
                    assert.equal(err, 'Not implemented');
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
            token: 'token'
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
                    assert.equal(err, 'Not implemented');
                })
        );
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
                    assert.equal(err, 'Not implemented');
                })
        );
    });

    describe('addWebhook', () => {
        const config = {
            scmUri: 'github.com:20161206:branch',
            token: 'token',
            url: 'https://bob.by/ford'
        };

        it('returns data from underlying method', () => {
            const expectedOutput = 'whenYourOpponentIsProgrammedToLose';

            instance._addWebhook = () => Promise.resolve(expectedOutput);

            return instance.addWebhook({
                scmUri: 'github.com:20161206:branch',
                token: 'token',
                url: 'https://bob.by/ford'
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
                   assert.strictEqual(err, 'Not implemented');
               })
        );
    });
});
