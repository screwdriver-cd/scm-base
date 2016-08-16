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
            return new Promise((resolve, reject) => {
                process.nextTick(() => reject(result.error));
            });
        }

        return this._getPermissions(config);
    }

    _getPermissions() {
        return new Promise((resolve, reject) => {
            process.nextTick(() => reject('not implemented'));
        });
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
            return new Promise((resolve, reject) => {
                process.nextTick(() => reject(result.error));
            });
        }

        return this._getCommitSha(config);
    }

    _getCommitSha() {
        return new Promise((resolve, reject) => {
            process.nextTick(() => reject('not implemented'));
        });
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
            return new Promise((resolve, reject) => {
                process.nextTick(() => reject(result.error));
            });
        }

        return this._updateCommitStatus(config);
    }

    _updateCommitStatus() {
        return new Promise((resolve, reject) => {
            process.nextTick(() => reject('not implemented'));
        });
    }
}

module.exports = ScmBase;
