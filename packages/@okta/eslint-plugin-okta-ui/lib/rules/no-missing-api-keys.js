const _ = require('underscore');
const loginEnBundle = require('../../../i18n/src/json/login.json');
const { readFileSync } = require('fs-extra');
module.exports = {
  meta: {
    docs: {
      description: 'Detect missing i18n keys from json mock files',
      category: 'i18n Issues',
      recommended: true,
    },
    messages: {
      missingApiKeysLoginBundle: '"{{i18nKey}}" is missing from login.properties.',
      missingi18nKeyApiResponse: 'API mock "{{file}}" does not have an i18nKey. Avoid hard-coding English strings.'
    },
  },
  create(context) {
    const ignoreKeys = [
      'tooManyRequests'// oie.tooManyRequests exists in the login bundle. We added oie.tooManyRequests instead of making a backend change.
    ];
    return {
      'Program': function (node) {
        const fileName = context.getFilename();
        const jsonContent = JSON.parse(readFileSync(fileName, 'utf8'));
        const messages = jsonContent.messages;
        if (!messages || !messages.value || !messages.value.length) { return; }
        const value = messages.value && messages.value[0];
        const i18nKey = value.i18n && value.i18n.key;
        // check if i18n key exists in mocks
        if (!i18nKey) {
          const file = fileName.split('idp/idx/')[1];
          context.report({
            messageId: 'missingi18nKeyApiResponse',
            data: {
              file
            },
            loc: {
              start: { line: 0, column: 0 }
            },
          });
          return;
        }
        // check if i18n keys returned from API are added to login.properties
        if (!loginEnBundle[i18nKey] && !ignoreKeys.includes(i18nKey)) {
          context.report({
            messageId: 'missingApiKeysLoginBundle',
            data: {
              i18nKey,
            },
            loc: {
              start: { line: 0, column: 0 }
            },
          });
        }
      },
    };
  },
};