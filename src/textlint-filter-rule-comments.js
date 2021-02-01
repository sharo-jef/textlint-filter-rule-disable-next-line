"use strict";
const {parseRuleIds, getValuesFromHTMLComment, isHTMLComment} = require('./parse-comment.js');
const defaultOptions = {
    disablingComment: 'textlint-disable-next-line',
};
module.exports = function(context, options = defaultOptions) {
    const {Syntax, RuleError, fixer, report, getSource, shouldIgnore} = context;
    if (options.disablingComment && typeof options.disablingComment !== 'string') {
        throw TypeError(`Type of option value was invalid. Expected type was string but ${typeof options.disablingComment} was given.`);
    }
    const disablingComments = [];
    const disablingComment = options.disablingComment || defaultOptions.disablingComment;

    return {
        [Syntax.Html](node) {
            const nodeValue = getSource(node);
            if (!isHTMLComment(nodeValue)) {
                return;
            }
            disablingComments.push({
                loc: node.loc,
                rules: [],
            });
            const comments = getValuesFromHTMLComment(nodeValue);
            comments.forEach(commentValue => {
                if (commentValue.indexOf(disablingComment) !== -1) {
                    const configValue = commentValue.replace(disablingComment, '');
                    configValue.replace(/\s*,\s*/g, ',').split(/,+/).forEach(name => {
                        name = name.trim();
                        if (!name) {
                            return;
                        }
                        disablingComments[disablingComments.length - 1].rules.push(name);
                    });
                }
            });
        },
        [Syntax.Comment](node) {
            const commentValue = node.value || '';
            if (new RegExp(disablingComment).test(commentValue)) {
                disablingComments.push({
                    loc: node.loc,
                    rules: [],
                });
                const configValue = commentValue.replace(disablingComment, '');
                configValue.replace(/\s*,\s*/g, ',').split(/,+/).forEach(name => {
                    name = name.trim();
                    if (!name) {
                        return;
                    }
                    disablingComments[disablingComments.length - 1].rules.push(name);
                });
            }

        },
        [`${Syntax.Document}:exit`](node) {console.log(JSON.stringify(disablingComments, null, 4));
            node.children.reduce((config, child) => {
                if (config.disable) {
                    if (config.rules.length === 0) {
                        shouldIgnore(child.range, { ruleId: '*' });
                    } else {
                        config.rules.forEach(rule => {
                            console.log(rule);
                            shouldIgnore(child.range, { ruleId: rule });
                        });
                    }
                }
                config = { disable: false, rules: [] };
                for (const conf of disablingComments) {
                    if (
                        conf.loc.start.line === child.loc.start.line
                        && conf.loc.start.column === child.loc.start.column
                    ) {
                        config.disable = true;
                        config.rules = conf.rules;
                        break;
                    }
                }
                console.log(config);
                return config;
            }, { disable: false, rules: [] });
        },
    };
};
