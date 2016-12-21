'use strict';

/* eslint-disable no-underscore-dangle */
const Joi = require('joi');
const dataSchema = require('screwdriver-data-schema');

/**
 * Validate the config using the schema
 * @method  validate
 * @param  {Object}    config       Configuration
 * @param  {Object}    schema       Joi object used for validation
 * @return {Promise}
 */
function validate(config, schema) {
    const result = Joi.validate(config, schema);

    if (result.error) {
        return Promise.reject(result.error);
    }

    return Promise.resolve(config);
}

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
     * Adds the Screwdriver webhook to the SCM repository
     *
     * If the repository already has the desired webhook, it will instead update the webhook to
     * ensure it has all the up-to-date information and settings (e.g., events)
     * @method addWebhook
     * @param  {Object}     config
     * @param  {String}     config.scmUri      SCM URI to add the webhook to
     * @param  {String}     config.token       Service token to authenticate with the SCM service
     * @param  {String}     config.webhookUrl  The URL to use for the webhook notifications
     * @return {Promise}                       Resolves when operation completed without failure
     */
    addWebhook(config) {
        return validate(config, dataSchema.plugins.scm.addWebhook)
            .then(() => this._addWebhook(config));
    }

    _addWebhook() {
        return Promise.reject('Not implemented');
    }

    /**
     * Parse the url for a repo for the specific source control
     * @method parseurl
     * @param  {Object}    config
     * @param  {String}    config.checkoutUrl       Url to parse
     * @param  {String}    config.token             The token used to authenticate to the SCM
     * @return {Promise}
     */
    parseUrl(config) {
        return validate(config, dataSchema.plugins.scm.parseUrl)
            .then(validUrl => this._parseUrl(validUrl))
            .then(uri => validate(uri, Joi.reach(dataSchema.models.pipeline.base, 'scmUri')));
    }

    _parseUrl() {
        return Promise.reject('Not implemented');
    }

    /**
     * Parse the webhook for the specific source control
     * @method parseHook
     * @param  {Object}     headers     The request headers associated with the webhook payload
     * @param  {Object}     payload     The webhook payload received from the SCM service
     * @return {Promise}
     */
    parseHook(headers, payload) {
        return this._parseHook(headers, payload);
    }

    _parseHook() {
        return Promise.reject('Not implemented');
    }

    /**
     * Checkout the source code from a repository; resolves as an object with checkout commands
     * @method getCheckoutCommand
     * @param  {Object}    config
     * @param  {String}    config.branch        Pipeline branch
     * @param  {String}    config.host          Scm host to checkout source code from
     * @param  {String}    config.org           Scm org name
     * @param  {String}    config.repo          Scm repo name
     * @param  {String}    config.sha           Commit sha
     * @param  {String}    [config.prRef]       PR reference (can be a PR branch or reference)
     * @return {Promise}
     */
    getCheckoutCommand(config) {
        return validate(config, dataSchema.plugins.scm.getCheckoutCommand)
            .then(validCheckout => this._getCheckoutCommand(validCheckout))
            .then(checkoutCommand => validate(checkoutCommand,
                dataSchema.core.scm.command));
    }

    _getCheckoutCommand() {
        return Promise.reject('Not implemented');
    }

    /**
     * Gives the commands needed for setup before the build starts
     * @method getSetupCommand
     * @param  {Object}         o           Information about the environment for setup
     * @param  {PipelineModel}  o.pipeline  Pipeline model for the build
     * @param  {Object}         o.build     Build configuration for the build (before creation)
     * @return {Promise}
     */
    getSetupCommand(o) {
        const [host, , branch] = o.pipeline.scmUri.split(':');
        const [org, repo] = o.pipeline.scmRepo.name.split('/');
        const checkoutConfig = {
            branch,
            host,
            org,
            repo,
            sha: o.build.sha
        };

        if (o.build.prRef) {
            checkoutConfig.prRef = o.build.prRef;
        }

        return this.getCheckoutCommand(checkoutConfig).then(c => c.command);
    }

    /**
     * Decorate the url for the specific source control
     * @method decorateUrl
     * @param  {Object}    config
     * @param  {String}    config.scmUri       SCM uri to decorate
     * @param  {String}    config.token        The token used to authenticate to the SCM
     * @return {Promise}
     */
    decorateUrl(config) {
        return validate(config, dataSchema.plugins.scm.decorateUrl)
            .then(validUrl => this._decorateUrl(validUrl))
            .then(decoratedUrl => validate(decoratedUrl, dataSchema.core.scm.repo));
    }

    _decorateUrl() {
        return Promise.reject('Not implemented');
    }

    /**
     * Decorate the commit for the specific source control
     * @method decorateCommit
     * @param  {Object}    config
     * @param  {String}    config.sha           Commit sha to decorate
     * @param  {String}    config.scmUri        SCM uri
     * @param  {String}    config.token         The token used to authenticate to the SCM
     * @return {Promise}
     */
    decorateCommit(config) {
        return validate(config, dataSchema.plugins.scm.decorateCommit)
            .then(validCommit => this._decorateCommit(validCommit))
            .then(decoratedCommit => validate(decoratedCommit, dataSchema.core.scm.commit));
    }

    _decorateCommit() {
        return Promise.reject('Not implemented');
    }

    /**
     * Decorate the author for the specific source control
     * @method decorateAuthor
     * @param  {Object}    config
     * @param  {String}    config.username  Author to decorate
     * @param  {String}    config.token     The token used to authenticate to the SCM
     * @return {Promise}
     */
    decorateAuthor(config) {
        return validate(config, dataSchema.plugins.scm.decorateAuthor)
            .then(validAuthor => this._decorateAuthor(validAuthor))
            .then(decoratedAuthor => validate(decoratedAuthor, dataSchema.core.scm.user));
    }

    _decorateAuthor() {
        return Promise.reject('Not implemented');
    }

    /**
     * Get a users permissions on a repository
     * @method getPermissions
     * @param  {Object}   config            Configuration
     * @param  {String}   config.scmUri     The scmUri to get permissions on
     * @param  {String}   config.token      The token used to authenticate to the SCM
     * @return {Promise}
     */
    getPermissions(config) {
        return validate(config, dataSchema.plugins.scm.getPermissions)
            .then(validConfig => this._getPermissions(validConfig));
    }

    _getPermissions() {
        return Promise.reject('Not implemented');
    }

    /**
     * Get a commit sha for a specific repo#branch
     * @method getCommitSha
     * @param  {Object}   config            Configuration
     * @param  {String}   config.scmUri     The scmUri to get commit sha of
     * @param  {String}   config.token      The token used to authenticate to the SCM
     * @return {Promise}
     */
    getCommitSha(config) {
        return validate(config, dataSchema.plugins.scm.getCommitSha)
            .then(validConfig => this._getCommitSha(validConfig));
    }

    _getCommitSha() {
        return Promise.reject('Not implemented');
    }

    /**
     * Update the commit status for a given repo and sha
     * @method updateCommitStatus
     * @param  {Object}   config              Configuration
     * @param  {String}   config.scmUri       The scmUri to get permissions on
     * @param  {String}   config.sha          The sha to apply the status to
     * @param  {String}   config.buildStatus  The build status used for figuring out the commit status to set
     * @param  {String}   config.token        The token used to authenticate to the SCM
     * @param  {String}   [config.jobName]    Optional name of the job that finished
     * @param  {String}   config.url          Target url
     * @return {Promise}
     */
    updateCommitStatus(config) {
        return validate(config, dataSchema.plugins.scm.updateCommitStatus)
            .then(validConfig => this._updateCommitStatus(validConfig));
    }

    _updateCommitStatus() {
        return Promise.reject('Not implemented');
    }

    /**
    * Fetch content of a file from an scm repo
    * @method getFile
    * @param  {Object}   config              Configuration
    * @param  {String}   config.scmUri       The scmUri to get permissions on
    * @param  {String}   config.path         The file in the repo to fetch
    * @param  {String}   config.token        The token used to authenticate to the SCM
    * @return {Promise}
    */
    getFile(config) {
        return validate(config, dataSchema.plugins.scm.getFile)
            .then(validConfig => this._getFile(validConfig));
    }

    _getFile() {
        return Promise.reject('Not implemented');
    }

    /**
     * Return a valid Bell configuration (for OAuth)
     * @method getBellConfiguration
     * @return {Promise}
     */
    getBellConfiguration() {
        return this._getBellConfiguration();
    }

    _getBellConfiguration() {
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
}

module.exports = ScmBase;
