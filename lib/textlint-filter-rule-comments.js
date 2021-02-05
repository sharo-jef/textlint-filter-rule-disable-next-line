"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./parse-comment.js'),
    parseRuleIds = _require.parseRuleIds,
    getValuesFromHTMLComment = _require.getValuesFromHTMLComment,
    isHTMLComment = _require.isHTMLComment;

var defaultOptions = {
    disablingComment: 'textlint-disable-next-line'
};
module.exports = function (context) {
    var _ref;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions;
    var Syntax = context.Syntax,
        RuleError = context.RuleError,
        fixer = context.fixer,
        report = context.report,
        getSource = context.getSource,
        shouldIgnore = context.shouldIgnore;

    if (options.disablingComment && typeof options.disablingComment !== 'string') {
        throw TypeError('Type of option value was invalid. Expected type was string but ' + _typeof(options.disablingComment) + ' was given.');
    }
    var disablingComments = [];
    var disablingComment = options.disablingComment || defaultOptions.disablingComment;
    console.log('disabling comment:', disablingComment);

    return _ref = {}, _defineProperty(_ref, Syntax.Html, function (node) {
        var nodeValue = getSource(node);
        if (!isHTMLComment(nodeValue)) {
            return;
        }
        disablingComments.push({
            loc: node.loc,
            rules: []
        });
        var comments = getValuesFromHTMLComment(nodeValue);
        comments.forEach(function (commentValue) {
            if (commentValue.indexOf(disablingComment) !== -1) {
                var configValue = commentValue.replace(disablingComment, '');
                configValue.replace(/\s*,\s*/g, ',').split(/,+/).forEach(function (name) {
                    name = name.trim();
                    if (!name) {
                        return;
                    }
                    disablingComments[disablingComments.length - 1].rules.push(name);
                });
            }
        });
    }), _defineProperty(_ref, Syntax.Comment, function (node) {
        var commentValue = node.value || '';
        if (new RegExp(disablingComment).test(commentValue)) {
            disablingComments.push({
                loc: node.loc,
                rules: []
            });
            var configValue = commentValue.replace(disablingComment, '');
            configValue.replace(/\s*,\s*/g, ',').split(/,+/).forEach(function (name) {
                name = name.trim();
                if (!name) {
                    return;
                }
                disablingComments[disablingComments.length - 1].rules.push(name);
            });
        }
    }), _defineProperty(_ref, Syntax.Document + ':exit', function undefined(node) {
        node.children.reduce(function (config, child) {
            if (config.disable) {
                if (config.rules.length === 0) {
                    shouldIgnore(child.range, { ruleId: '*' });
                } else {
                    config.rules.forEach(function (rule) {
                        shouldIgnore(child.range, { ruleId: rule });
                    });
                }
            }
            config = { disable: false, rules: [] };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = disablingComments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var conf = _step.value;

                    if (conf.loc.start.line === child.loc.start.line && conf.loc.start.column === child.loc.start.column) {
                        config.disable = true;
                        config.rules = conf.rules;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return config;
        }, { disable: false, rules: [] });
    }), _ref;
};
//# sourceMappingURL=textlint-filter-rule-comments.js.map