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
    const result = schema.validate(config);

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
     * Get the webhook events mapping of screwdriver events and scm events
     * @method getWebhookEventsMapping
     * @param  {Object}    config                   Configuration
     * @param  {String}    [config.scmContext]      The scm context name
     * @return {Object}     Returns a mapping of the events
     */
    getWebhookEventsMapping(config) {
        return this._getWebhookEventsMapping(config);
    }

    _getWebhookEventsMapping() {
        return new Error('Not implemented');
    }

    /**
     * Returns whether auto deploy key generation is enabled on or not
     * @method autoDeployKeyGenerationEnabled
     * @param  {Object}    config                   Configuration
     * @param  {String}    [config.scmContext]      The scm context name
     * @return {Boolean}
     */
    autoDeployKeyGenerationEnabled() {
        return this.config.autoDeployKeyGeneration || false;
    }

    /**
     * Generate and add the public deploy key to the specific scm
     * @method addDeployKey
     * @param  {Object}    config                   Configuration
     * @param  {String}    config.checkoutUrl       Url to parse
     * @param  {String}    config.token             The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]      The scm context name
     * @return {Promise}
     */
    addDeployKey(config) {
        return validate(config, dataSchema.plugins.scm.addDeployKey)
            .then(() => this._addDeployKey(config));
    }

    _addDeployKey() {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Parse the url for a repo for the specific source control
     * @method parseUrl
     * @param  {Object}    config                   Configuration
     * @param  {String}    config.checkoutUrl       Url to parse
     * @param  {String}    config.token             The token used to authenticate to the SCM
     * @param  {String}    [config.scmContext]      The scm context name
     * @param  {String}    [config.rootDir]         Root directory where source code is
     * @return {Promise}
     */
    parseUrl(config) {
        return validate(config, dataSchema.plugins.scm.parseUrl)
            .then(validUrl => this._parseUrl(validUrl))
            .then(uri => validate(uri, dataSchema.models.pipeline.base.extract('scmUri')));
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
     * @param  {String}    [config.rootDir]       Root directory of source code
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
        const [host, , branch, rootDir] = o.pipeline.scmUri.split(':');
        const [org, repo] = o.pipeline.scmRepo.name.split('/');
        const prBranchRegex = /^~pr:(.*)$/;
        const checkoutConfig = {
            branch,
            host,
            org,
            repo,
            sha: o.build.sha,
            scmContext: o.pipeline.scmContext
        };

        if (rootDir) {
            checkoutConfig.rootDir = rootDir;
        }

        if (o.build.prRef) {
            const match = prBranchRegex.exec(o.build.startFrom);

            checkoutConfig.prRef = o.build.prRef;

            if (match !== null) {
                // Overwrite base branch by pr specific branch if specified.
                // prRef needs to be merged into the branch specified in startFrom not main branch.
                checkoutConfig.branch = match[1];
            }
            checkoutConfig.prSource = o.build.prSource;
            if (o.build.prInfo) {
                checkoutConfig.prBranchName = o.build.prInfo.prBranchName;
            }
        }

        if (o.build.baseBranch) {
            checkoutConfig.commitBranch = o.build.baseBranch;
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
     * Get a commit sha from a reference
     * @method getCommitRefSha
     * @param  {Object}   config
     * @param  {String}   config.token         The token used to authenticate to the SCM
     * @param  {String}   config.owner         The owner of the target repository
     * @param  {String}   config.repo          The target repository name
     * @param  {String}   config.ref           The reference which we want
     * @param  {String}   [config.scmContext]  The scm context name
     * @return {Promise}                       Resolves to the commit sha
     */
    getCommitRefSha(config) {
        return validate(config, dataSchema.plugins.scm.getCommitRefSha)
            .then(validConfig => this._getCommitRefSha(validConfig));
    }

    _getCommitRefSha() {
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
     * @param  {String}   [config.scmContext]     The SCM context name
     * @param  {String}   [config.context]        The context of the status
     * @param  {String}   [config.description]    The description of the status
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
                        name: dataSchema.models.job.base.extract('name').required(),
                        ref: Joi.string().required(),
                        username: dataSchema.core.scm.pr.extract('username'),
                        title: dataSchema.core.scm.pr.extract('title'),
                        createTime: dataSchema.core.scm.pr.extract('createTime'),
                        url: dataSchema.core.scm.pr.extract('url'),
                        userProfile: dataSchema.core.scm.pr.extract('userProfile')
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
                name: dataSchema.models.job.base.extract('name').required(),
                sha: dataSchema.models.build.base.extract('sha').required(),
                ref: Joi.string().required(),
                prBranchName: Joi.string().optional(),
                username: dataSchema.core.scm.user.extract('username'),
                title: dataSchema.core.scm.pr.extract('title'),
                createTime: dataSchema.core.scm.pr.extract('createTime'),
                url: dataSchema.core.scm.pr.extract('url'),
                userProfile: dataSchema.core.scm.pr.extract('userProfile'),
                baseBranch: dataSchema.core.scm.pr.extract('baseBranch'),
                mergeable: Joi.boolean().allow(null),
                prSource: Joi.string().optional()
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
                    commentId: dataSchema.models.job.base.extract('id').required(),
                    createTime: dataSchema.models.build.base.extract('createTime').required(),
                    username: dataSchema.core.scm.user.extract('username').required()
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
        const schema = Joi.array().items(
            dataSchema.models.pipeline.base.extract('scmContext').required()
        );
        const validateResult = schema.validate(result);

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

    /**
     * Open a pull request on the repository with given file change
     *
     * @method openPr
     * @param  {Object}     config                  Configuration
     * @param  {String}     config.checkoutUrl      Checkout url to the repo
     * @param  {String}     config.token            Service token to authenticate with the SCM service
     * @param  {String}     config.files            Files to open pull request with
     * @param  {String}     config.title            Pullrequest title
     * @param  {String}     config.message          Pullrequest message
     * @param  {String}     [config.scmContext]     The scm context name
     * @return {Promise}                            Resolves when operation completed without failure
     */
    openPr(config) {
        return validate(config, dataSchema.plugins.scm.openPr)
            .then(() => this._openPr(config));
    }

    _openPr() {
        return Promise.reject(new Error('Not implemented'));
    }
}

module.exports = ScmBase;
