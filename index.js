'use strict';
/* eslint-disable no-underscore-dangle */
const Joi = require('joi');
const dataSchema = require('screwdriver-data-schema');

class ScmBase {
    /**
     * Constructor for Scm
     * @method constructor
     * @param  {Object}    config Configuration
     * @return {ScmBase}
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Reload configuration
     * @method configure
     * @param  {Object}     config      Configuration
     */
    configure(config) {
        this.config = config;
    }

    /**
     * Format the scmUrl for the specific source control
     * @method formatScmUrl
     * @param {String}    scmUrl        Scm Url to format properly
     */
    formatScmUrl() {
        throw new Error('formatScmUrl not implemented');
    }

    /**
     * Get a users permissions on a repository
     * @method getPermissions
     * @param  {Object}   config            Configuration
     * @param  {String}   config.scmUrl     The scmUrl to get permissions on
     * @param  {String}   config.token      The token used to authenticate to the SCM
     * @return {Promise}
     */
    getPermissions(config) {
        const result = Joi.validate(config, dataSchema.plugins.scm.getPermissions);

        if (result.error) {
            return Promise.reject(result.error);
        }

        return this._getPermissions(config);
    }

    _getPermissions() {
        return Promise.reject('Not implemented');
    }

    /**
     * Get a commit sha for a specific repo#branch
     * @method getCommitSha
     * @param  {Object}   config            Configuration
     * @param  {String}   config.scmUrl     The scmUrl to get commit sha of
     * @param  {String}   config.token      The token used to authenticate to the SCM
     * @return {Promise}
     */
    getCommitSha(config) {
        const result = Joi.validate(config, dataSchema.plugins.scm.getCommitSha);

        if (result.error) {
            return Promise.reject(result.error);
        }

        return this._getCommitSha(config);
    }

    _getCommitSha() {
        return Promise.reject('Not implemented');
    }

    /**
     * Update the commit status for a given repo and sha
     * @method get
     * @param  {Object}   config              Configuration
     * @param  {String}   config.scmUrl       The scmUrl to get permissions on
     * @param  {String}   config.sha          The sha to apply the status to
     * @param  {String}   config.buildStatus  The build status used for figuring out the commit status to set
     * @param  {String}   config.token        The token used to authenticate to the SCM
     * @return {Promise}
     */
    updateCommitStatus(config) {
        const result = Joi.validate(config, dataSchema.plugins.scm.updateCommitStatus);

        if (result.error) {
            return Promise.reject(result.error);
        }

        return this._updateCommitStatus(config);
    }

    _updateCommitStatus() {
        return Promise.reject('Not implemented');
    }

    /**
    * Fetch content of a file from an scm repo
    * @method getFile
    * @param  {Object}   config              Configuration
    * @param  {String}   config.scmUrl       The scmUrl to get permissions on
    * @param  {String}   config.path         The file in the repo to fetch
    * @param  {String}   config.token        The token used to authenticate to the SCM
    * @return {Promise}
    */
    getFile(config) {
        const result = Joi.validate(config, dataSchema.plugins.scm.getFile);

        if (result.error) {
            return Promise.reject(result.error);
        }

        return this._getFile(config);
    }

    _getFile() {
        return Promise.reject('Not implemented');
    }

    /**
     * Return statistics on the executor
     * @method stats
     * @return {Object} object           Hash containing metrics for the executor
     */
    stats() {
        return {};
    }

    /**
     * Return a unique identifier for the scmUrl
     * @method getRepoId
     * @param  {Object}    config        Configuration
     * @param  {String}    config.scmUrl The scmUrl to generate ID
     * @param  {String}    config.token  The token used to authenticate to the SCM
     * @return {Promise}
     */
    getRepoId(config) {
        const result = Joi.validate(config, dataSchema.plugins.scm.getRepoId);

        if (result.error) {
            return Promise.reject(result.error);
        }

        return this._getRepoId().then((repo) => {
            const outputResult = Joi.validate(repo, dataSchema.core.scm.repo);

            if (outputResult.error) {
                return Promise.reject(outputResult.error);
            }

            return Promise.resolve(repo);
        });
    }

    _getRepoId() {
        return Promise.reject('Not implemented');
    }
}

module.exports = ScmBase;
