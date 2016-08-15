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

    describe('formatScmUrl', () => {
        it('throws an error', () => {
            assert.throws(() => instance.formatScmUrl('foo'), 'formatScmUrl not implemented');
        });
    });

    describe('getPermissons', () => {
        it('returns error when invalid config object', () => instance.getPermissions({})
            .then(() => {
                assert(false, 'you will never get dis');
            })
            .catch(err => {
                assert.isOk(err, 'Error should be returned');
                assert.equal(err.name, 'ValidationError');
            })
        );

        it('returns not implemented', () => {
            const config = {
                scmUrl: 'foo',
                user: 'bar',
                token: 'token'
            };

            instance.getPermissions(config)
              .then(() => {
                  assert(false, 'you will never get dis');
              })
              .catch(err => {
                  assert.isOk(err, 'Error should be returned');
                  assert.equal(err.message, 'not implemented');
              });
        });
    });

    describe('getCommitSha', () => {
        it('returns error when invalid config object', () => instance.getCommitSha({})
            .then(() => {
                assert(false, 'you will never get dis');
            })
            .catch(err => {
                assert.isOk(err, 'Error should be returned');
                assert.equal(err.name, 'ValidationError');
            })
        );

        it('returns not implemented', () => {
            const config = {
                scmUrl: 'foo',
                token: 'token'
            };

            instance.getCommitSha(config)
              .then(() => {
                  assert(false, 'you will never get dis');
              })
              .catch(err => {
                  assert.isOk(err, 'Error should be returned');
                  assert.equal(err.message, 'not implemented');
              });
        });
    });

    describe('updateCommitStatus', () => {
        it('returns error when invalid config object', () => instance.updateCommitStatus({})
            .then(() => {
                assert(false, 'you will never get dis');
            })
            .catch(err => {
                assert.isOk(err, 'Error should be returned');
                assert.equal(err.name, 'ValidationError');
            })
        );

        it('returns not implemented', () => {
            const config = {
                scmUrl: 'foo',
                sha: 'sha1',
                buildStatus: 'stating',
                token: 'token'
            };

            instance.updateCommitStatus(config)
              .then(() => {
                  assert(false, 'you will never get dis');
              })
              .catch(err => {
                  assert.isOk(err, 'Error should be returned');
                  assert.equal(err.message, 'not implemented');
              });
        });
    });
});
