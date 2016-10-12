'use strict';

/* eslint-disable no-underscore-dangle */
const assert = require('chai').assert;
const mockery = require('mockery');
const Joi = require('joi');

describe('index test', () => {
    let instance;
    let ScmBase;
    let schemaMock;
    const MODEL = {
        scmUri: Joi
            .string().regex(/^([^:]+):([\w-]+):(.+)$/)
            .description('Unique identifier for the application')
            .example('github.com:123456:master')
    };

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        schemaMock = {
            plugins: {
                scm: {
                    getPermissions: Joi.object().keys({
                        scmUri: Joi.string().required(),
                        token: Joi.string().required()
                    }).required(),
                    getCommitSha: Joi.object().keys({
                        scmUri: Joi.string().required(),
                        token: Joi.string().required()
                    }).required(),
                    updateCommitStatus: Joi.object().keys({
                        scmUri: Joi.string().required(),
                        token: Joi.string().required(),
                        buildStatus: Joi.string().required(),
                        sha: Joi.string().required()
                    }).required(),
                    getFile: Joi.object().keys({
                        scmUri: Joi.string().required(),
                        token: Joi.string().required(),
                        path: Joi.string().required()
                    }).required(),
                    parseUrl: Joi.object().keys({
                        checkoutUrl: Joi.string().required(),
                        token: Joi.string().required()
                    }).required(),
                    decorateUrl: Joi.object().keys({
                        scmUri: Joi.string().required(),
                        token: Joi.string().required()
                    }).required(),
                    decorateCommit: Joi.object().keys({
                        sha: Joi.string().required(),
                        scmUri: Joi.string().required(),
                        token: Joi.string().required()
                    }).required(),
                    decorateAuthor: Joi.object().keys({
                        username: Joi.string().required(),
                        token: Joi.string().required()
                    }).required()
                }
            },
            core: {
                scm: {
                    repo: Joi.object().keys({
                        name: Joi.string().required(),
                        branch: Joi.string().required(),
                        url: Joi.string().required()
                    }).required(),
                    commit: Joi.object().keys({
                        username: Joi.string().required(),
                        message: Joi.string().required(),
                        url: Joi.string().required()
                    }).required(),
                    user: Joi.object().keys({
                        name: Joi.string().required(),
                        username: Joi.string().required(),
                        avatar: Joi.string().required(),
                        url: Joi.string().required()
                    }).required(),
                    hook: Joi.object().keys({
                        type: Joi.string().required(),
                        action: Joi.string().required(),
                        prNum: Joi.number().optional(),
                        checkoutUrl: Joi.string().required(),
                        branch: Joi.string().required(),
                        prRef: Joi.string().optional(),
                        sha: Joi.string().required(),
                        username: Joi.string().required()
                    }).required()
                }
            },
            models: {
                pipeline: {
                    base: Joi.object(MODEL)
                }
            }
        };
        mockery.registerMock('screwdriver-data-schema', schemaMock);
        /* eslint-disable global-require */
        ScmBase = require('../index');
        /* eslint-enable global-require */

        instance = new ScmBase({ foo: 'bar' });
    });

    afterEach(() => {
        instance = null;
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
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
            checkoutUrl: 'foo',
            token: 'bar'
        };

        it('returns error when invalid config object', () => instance.parseUrl({})
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
                    assert.equal(err.name, 'Error');
                });
        });

        it('returns not implemented', () => instance.parseUrl(config)
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

        it('returns error when invalid output', () => {
            instance._parseHook = () => {
                const result = {
                    invalid: 'object'
                };

                return result;
            };

            instance.parseHook(headers, payload)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.instanceOf(err, Error);
                    assert.equal(err.name, 'ValidationError');
                });
        });

        it('returns not implemented', () => {
            assert.throws(() => instance.parseHook(headers, payload), 'Not implemented');
        });
    });

    describe('decorateUrl', () => {
        const config = {
            scmUri: 'foo',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.decorateUrl({})
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

        it('returns not implemented', () => instance.decorateUrl(config)
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
            sha: '123abc',
            scmUri: 'foo',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.decorateCommit({})
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

        it('returns not implemented', () => instance.decorateCommit(config)
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

        it('returns error when invalid config object', () => instance.decorateAuthor({})
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

        it('returns not implemented', () => instance.decorateAuthor(config)
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
            scmUri: 'foo',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.getPermissions({})
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

        it('returns not implemented', () => instance.getPermissions(config)
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
            scmUri: 'foo',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.getCommitSha({})
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

        it('returns not implemented', () => instance.getCommitSha(config)
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
            scmUri: 'foo',
            sha: 'sha1',
            buildStatus: 'stating',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.updateCommitStatus({})
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

        it('returns not implemented', () => instance.updateCommitStatus(config)
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
            scmUri: 'foo',
            path: 'testFile',
            token: 'token'
        };

        it('returns error when invalid config object', () => instance.getFile({})
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

        it('returns not implemented', () => instance.getFile(config)
                .then(() => {
                    assert.fail('you will never get dis');
                })
                .catch((err) => {
                    assert.equal(err, 'Not implemented');
                })
        );
    });
});
