'use strict';

/* eslint-disable no-underscore-dangle */
const Joi = require('joi');
const dataSchema = require('screwdriver-data-schema');
const { getAnnotations } = require('./lib/helper');

const repoManifestAnnotation = 'screwdriver.cd/repoManifest';

/**
 * Validate the config using the schema
 * @method  validate
 * @param  {Object}    config       Configuration
 * @param  {Object}    schema       Joi object used for validation
 * @return {Promise}
 */
function validate(config, schema) {
    const result = Joi.validate(config, schema);

    return result.error ? Promise.reject(result.error) : Promise.resolve(config);
}

class ScmBase {
    /**
     * Constructor for Scm
     * @method constructor
     * @param  {Object}     config      Configuration object
     * @return {ScmBase}
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Reload configuration
     * @method configure
     * @param  {Object}     config      Configuration object
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
     * @param  {Object}     config                  Configuration
     * @param  {String}     config.scmUri           SCM URI to add the webhook to
     * @param  {String}     config.token            Service token to authenticate with the SCM service
     * @param  {String}     config.webhookUrl       The URL to use for the webhook notifications
     * @param  {String}     [config.scmContext]     The scm context name
     * @return {Promise}                            Resolves when operation completed without failure
     */
    addWebhook(config) {
        return validate(config, dataSchema.plugins.scm.addWebhook)
            .then(() => this._addWebhook(config));
    }

    _addWebhook() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Parse the url for a repo for the specific source control
     * @method parseUrl
     * @param  {Object}    config                   Configuration
     * @param  {String}    config.checkoutUrl       Url to parse
     * @param  {String}    config.token             The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]      The scm context name
     * @return {Promise}
     */
    parseUrl(config) {
        return validate(config, dataSchema.plugins.scm.parseUrl)
            .then(validUrl => this._parseUrl(validUrl))
            .then(uri => validate(uri, Joi.reach(dataSchema.models.pipeline.base, 'scmUri')));
    }

    _parseUrl() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Parse the webhook for the specific source control
     * @method parseHook
     * @param  {Object}     headers     The request headers associated with the webhook payload
     * @param  {Object}     payload     The webhook payload received from the SCM service
     * @return {Promise}
     */
    parseHook(headers, payload) {
        return this._parseHook(headers, payload)
            .then(hook => validate(hook, dataSchema.plugins.scm.parseHookOutput));
    }

    _parseHook() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Parse the webhook to get the changed files
     * @method getChangedFiles
     * @param  {Object}    config          Configuration
     * @param  {String}    config.type     The type of action from Git (can be 'pr' or 'repo')
     * @param  {Object}    config.payload  The webhook payload received from the SCM service
     * @param  {String}    config.token    The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]      The scm context name
     * @return {Promise}                   Returns an array of changed files
     */
    getChangedFiles(config) {
        return validate(config, dataSchema.plugins.scm.getChangedFilesInput)
            .then(validInput => this._getChangedFiles(validInput))
            .then(changedFiles => validate(changedFiles,
                dataSchema.plugins.scm.getChangedFilesOutput));
    }

    _getChangedFiles() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Checkout the source code from a repository; resolves as an object with checkout commands
     * @method getCheckoutCommand
     * @param  {Object}    config                 Configuration
     * @param  {String}    config.branch          Pipeline branch
     * @param  {String}    config.host            Scm host to checkout source code from
     * @param  {String}    config.org             Scm org name
     * @param  {String}    config.repo            Scm repo name
     * @param  {String}    config.sha             Commit sha
     * @param  {String}    [config.scmContext]    The scm context name
     * @param  {String}    [config.prRef]         PR reference (can be a PR branch or reference)
     * @param  {String}    [config.manifest]      Repo manifest URL (only defined if `screwdriver.cd/repoManifest` annotation is)
     * @return {Promise}
     */
    getCheckoutCommand(config) {
        return validate(config, dataSchema.plugins.scm.getCheckoutCommand)
            .then(validCheckout => this._getCheckoutCommand(validCheckout))
            .then(checkoutCommand => validate(checkoutCommand,
                dataSchema.core.scm.command));
    }

    _getCheckoutCommand() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Gives the commands needed for setup before the build starts
     * @method getSetupCommand
     * @param  {Object}         o           Information about the environment for setup
     * @param  {PipelineModel}  o.pipeline  Pipeline model for the build
     * @param  {Object}         o.job       Job configuration for the build
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
            sha: o.build.sha,
            scmContext: o.pipeline.scmContext
        };

        if (o.build.prRef) {
            checkoutConfig.prRef = o.build.prRef;
        }

        if (o.build.commitBranch) {
            checkoutConfig.commitBranch = o.build.commitBranch;
        }

        if (o.configPipeline) {
            const parentConfig = { sha: o.configPipelineSha };

            [parentConfig.host, , parentConfig.branch] = o.configPipeline.scmUri.split(':');
            [parentConfig.org, parentConfig.repo] = o.configPipeline.scmRepo.name.split('/');

            checkoutConfig.parentConfig = parentConfig;
        }

        const manifest = getAnnotations(o.job.permutations[0], repoManifestAnnotation);

        if (manifest) {
            checkoutConfig.manifest = manifest;
        }

        return this.getCheckoutCommand(checkoutConfig).then(c => c.command);
    }

    /**
     * Decorate the url for the specific source control
     * @method decorateUrl
     * @param  {Object}    config                Configuration
     * @param  {String}    config.scmUri         SCM uri to decorate
     * @param  {String}    config.token          The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]   The scm context name
     * @return {Promise}
     */
    decorateUrl(config) {
        return validate(config, dataSchema.plugins.scm.decorateUrl)
            .then(validUrl => this._decorateUrl(validUrl))
            .then(decoratedUrl => validate(decoratedUrl, dataSchema.core.scm.repo));
    }

    _decorateUrl() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Decorate the commit for the specific source control
     * @method decorateCommit
     * @param  {Object}    config                 Configuration
     * @param  {String}    config.sha             Commit sha to decorate
     * @param  {String}    config.scmUri          SCM uri
     * @param  {String}    config.token           The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]    The scm context name
     * @return {Promise}
     */
    decorateCommit(config) {
        return validate(config, dataSchema.plugins.scm.decorateCommit)
            .then(validCommit => this._decorateCommit(validCommit))
            .then(decoratedCommit => validate(decoratedCommit, dataSchema.core.scm.commit));
    }

    _decorateCommit() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Decorate the author for the specific source control
     * @method decorateAuthor
     * @param  {Object}    config
     * @param  {String}    config.username        Author to decorate
     * @param  {String}    config.token           The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]    The scm context name
     * @return {Promise}
     */
    decorateAuthor(config) {
        return validate(config, dataSchema.plugins.scm.decorateAuthor)
            .then(validAuthor => this._decorateAuthor(validAuthor))
            .then(decoratedAuthor => validate(decoratedAuthor, dataSchema.core.scm.user));
    }

    _decorateAuthor() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Get a users permissions on a repository
     * @method getPermissions
     * @param  {Object}   config                  Configuration
     * @param  {String}   config.scmUri           The scmUri to get permissions on
     * @param  {String}   config.token            The token used to authenticate to the SCM
     * @param  {String}   [config.scmContext]     The scm context name
     * @return {Promise}
     */
    getPermissions(config) {
        return validate(config, dataSchema.plugins.scm.getPermissions)
            .then(validConfig => this._getPermissions(validConfig));
    }

    _getPermissions() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Get a users permissions on an organization
     * @method getOrgPermissions
     * @param  {Object}   config                  Configuration
     * @param  {String}   config.organization     The organization to get permissions on
     * @param  {String}   config.username         The user to check against
     * @param  {String}   config.token            The token used to authenticate to the SCM
     * @param  {String}   [config.scmContext]     The scm context name
     * @return {Promise}
     */
    getOrgPermissions(config) {
        return validate(config, dataSchema.plugins.scm.getOrgPermissions)
            .then(validConfig => this._getOrgPermissions(validConfig));
    }

    _getOrgPermissions() {
        return Promise.reject('Not implemented');
    }

    /**
     * Get a commit sha for a specific repo#branch or pull request
     * @method getCommitSha
     * @param  {Object}   config                  Configuration
     * @param  {String}   config.scmUri           The scmUri to get commit sha of
     * @param  {String}   config.token            The token used to authenticate to the SCM
     * @param  {String}   [config.scmContext]     The scm context name
     * @param  {Integer}  [config.prNum]          The PR number used to fetch the sha
     * @return {Promise}
     */
    getCommitSha(config) {
        return validate(config, dataSchema.plugins.scm.getCommitSha)
            .then(validConfig => this._getCommitSha(validConfig));
    }

    _getCommitSha() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Update the commit status for a given repo and sha
     * @method updateCommitStatus
     * @param  {Object}   config                  Configuration
     * @param  {String}   config.scmUri           The scmUri to get permissions on
     * @param  {String}   config.sha              The sha to apply the status to
     * @param  {String}   config.buildStatus      The build status used for figuring out the commit status to set
     * @param  {String}   config.token            The token used to authenticate to the SCM
     * @param  {String}   [config.jobName]        Optional name of the job that finished
     * @param  {String}   config.url              Target url
     * @param  {Number}   [config.pipelineId]     Pipeline ID
     * @param  {String}   [config.scmContext]     The scm context name
     * @return {Promise}
     */
    updateCommitStatus(config) {
        return validate(config, dataSchema.plugins.scm.updateCommitStatus)
            .then(validConfig => this._updateCommitStatus(validConfig));
    }

    _updateCommitStatus() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Fetch content of a file from an scm repo
     * @method getFile
     * @param  {Object}   config                Configuration
     * @param  {String}   config.scmUri         The scmUri to get permissions on
     * @param  {String}   config.path           The file in the repo to fetch
     * @param  {String}   config.token          The token used to authenticate to the SCM
     * @param  {String}   [config.scmContext]   The scm context name
     * @return {Promise}
     */
    getFile(config) {
        return validate(config, dataSchema.plugins.scm.getFile)
            .then(validConfig => this._getFile(validConfig));
    }

    _getFile() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Get list of objects which consists of opened PR names and its ref
     * @method getOpenedPRs
     * @param  {Object}   config                Configuration
     * @param  {String}   config.scmUri         The scmUri to get opened PRs
     * @param  {String}   config.token          The token used to authenticate to the SCM
     * @param  {String}   [config.scmContext]   The scm context name
     * @return {Promise}
     */
    getOpenedPRs(config) {
        return validate(config, dataSchema.plugins.scm.getCommitSha) // includes scmUri, token and scmContext
            .then(validConfig => this._getOpenedPRs(validConfig))
            .then(jobList =>
                validate(jobList, Joi.array().items(
                    Joi.object().keys({
                        name: Joi.reach(dataSchema.models.job.base, 'name').required(),
                        ref: Joi.string().required(),
                        username: Joi.reach(dataSchema.core.scm.pr, 'username'),
                        title: Joi.reach(dataSchema.core.scm.pr, 'title'),
                        createTime: Joi.reach(dataSchema.core.scm.pr, 'createTime')
                    })
                ))
            );
    }

    _getOpenedPRs() {
        return Promise.reject(new Error('Not implemented'));
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
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Resolve a pull request object based on the config
     * @method getPrInfo
     * @param  {Object}   config                    Configuration
     * @param  {String}   config.scmUri             The scmUri to get PR info of
     * @param  {String}   config.token              The token used to authenticate to the SCM
     * @param  {Integer}  config.prNum              The PR number used to fetch the PR
     * @param  {String}   [config.scmContext]       The scm context name
     * @return {Promise}
     */
    getPrInfo(config) {
        return validate(config, dataSchema.plugins.scm.getCommitSha) // includes scmUri, token and scmContext
            .then(validConfig => this._getPrInfo(validConfig))
            .then(pr => validate(pr, Joi.object().keys({
                name: Joi.reach(dataSchema.models.job.base, 'name').required(),
                sha: Joi.reach(dataSchema.models.build.base, 'sha').required(),
                ref: Joi.string().required(),
                url: Joi.reach(dataSchema.core.scm.pr, 'url'),
                username: Joi.reach(dataSchema.core.scm.user, 'username'),
                title: Joi.reach(dataSchema.core.scm.pr, 'title'),
                createTime: Joi.reach(dataSchema.core.scm.pr, 'createTime')
            })));
    }

    _getPrInfo() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Resolve a pull request comment object based on config
     * @method addPrComment
     * @param  {Object}   config                    Configuration
     * @param  {String}   config.scmUri             The scmUri
     * @param  {String}   config.token              The token used to authenticate to the SCM
     * @param  {Integer}  config.prNum              The PR number used to fetch the PR
     * @param  {String}   config.comment            The PR comment
     * @param  {String}   [config.scmContext]       The scm context name
     * @return {Promise}
     */
    addPrComment(config) {
        return validate(config, dataSchema.plugins.scm.addPrComment) // includes scmUri, token and scmContext
            .then(validConfig => this._addPrComment(validConfig))
            .then(prComment => validate(prComment, Joi.alternatives().try(
                Joi.object().keys({
                    commentId: Joi.reach(dataSchema.models.job.base, 'id').required(),
                    createTime: Joi.reach(dataSchema.models.build.base, 'createTime').required(),
                    username: Joi.reach(dataSchema.core.scm.user, 'username').required()
                }),
                Joi.string().allow(null)
            )));
    }

    // Default to not fail since we will always call it in models
    _addPrComment() {
        return Promise.resolve(null);
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
     * Get an array of scm context (e.g. [github:github.com, gitlab:mygitlab])
     * @method getScmContexts
     * @return {Array}
     */
    getScmContexts() {
        const result = this._getScmContexts();
        const validateResult = Joi.validate(result, Joi.array().items(
            Joi.reach(dataSchema.models.pipeline.base, 'scmContext').required()
        ));

        return validateResult.error || result;
    }

    _getScmContexts() {
        throw new Error('Not implemented');
    }

    /**
     * Determine a scm module can handle the received webhook
     * @method canHandleWebhook
     * @param  {Object}     headers     The request headers associated with the webhook payload
     * @param  {Object}     payload     The webhook payload received from the SCM service
     * @return {Promise}
     */
    canHandleWebhook(headers, payload) {
        return this._canHandleWebhook(headers, payload);
    }

    _canHandleWebhook() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Get a name of scm context to display
     * @method getDisplayName
     * @return {String}
     */
    getDisplayName() {
        return this.config.displayName || '';
    }

    /**
     * Get the branch list related to the repository
     * @method getBranchList
     * @param  {Object}     config              Configuration
     * @param  {String}     config.token        Service token to authenticate with the SCM service
     * @param  {String}     config.scmUri       SCM URI to get the branch list
     * @param  {String}     [config.scmContext] The scm context name
     * @return {Promise}
     */
    getBranchList(config) {
        return validate(config, dataSchema.plugins.scm.getBranchList)
            .then(() => this._getBranchList(config));
    }

    _getBranchList() {
        return Promise.reject(new Error('Not implemented'));
    }
}

module.exports = ScmBase;
