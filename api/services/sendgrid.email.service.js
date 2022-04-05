'use strict';

const sgMail = require('@sendgrid/mail');
const validator = require('validator');

const log = require('../../api/helpers/log')('services:sendgrid.email')
const config = require('../../config/config');
const moment = require('moment');

sgMail.setApiKey(config.sendgrid.apiKey);
sgMail.setSubstitutionWrappers('{{', '}}');

function validateInputParams (params) {
  /*eslint-disable */
  const emailOptions = { allow_display_name: true }; // jshint ignore:line
  /*eslint-enable */
  if (!params) {
    throw new Error('Error! Missing params');
  }
  if (params.fromEmail && !validator.isEmail(params.fromEmail, emailOptions)) {
    throw new Error('Validation: fromEmail is not a valid "Name <email>". Rejecting notification ...');
  }
  if (!params.email || !validator.isEmail(params.email)) {
    throw new Error('Validation: email is not a valid email. Rejecting notification ...');
  }
  if (!params.subject) {
    throw new Error('Validation: subject is mandatory. Rejecting notification ...');
  }
  if (!params.emailHTML) {
    throw new Error('Validation: emailHTML is mandatory. Rejecting notification ...');
  }
  if (!config.sendgrid || !config.sendgrid.templateId) {
    throw new Error('Configuration: sendgrid.templateId is missing. Rejecting notification ...');
  }
  if (params.sendAt && !moment(params.sendAt).isValid()) {
    throw new Error('Validation: sendAt is not a valid timestamp');
  }
  if (params.sendAt &&
    (moment.unix(params.sendAt) < moment().add(1, 'minute') ||
      moment.unix(params.sendAt) > moment().add(72, 'hours'))) {
    throw new Error('Validation: Timestamp must be +1min and less than 72 hrs from now!');
  }
}

function setDefaults (params) {
  if (!params.whitelabelImageUrl || !validator.isURL(params.whitelabelImageUrl)) {
    params.whitelabelImageUrl = config.sendgrid.whitelabelImageUrl;
  }
}

async function helperSendEmail (params) {
  const substitutions = {
    'whitelabelimageurl': params.whitelabelImageUrl,
    'signature': params.signatureText || ''
  };

  let msg = {
    from: params.fromEmail || config.sendgrid.fromEmail,
    to: params.email,
    cc: params.emailCc,
    bcc: params.emailBcc,
    subject: params.subject,
    text: params.emailHTML,
    html: params.emailHTML,
    templateId: params.templateId || config.sendgrid.templateId,
    substitutions: substitutions,
    sendAt: params.sendAt,
    categories: []
  };

  if (params.attachments) {
    msg.attachments = params.attachments;
  }

  const result = await sgMail.send(msg);
  log.debug('helperSendEmail() Email sent successfully to %s', params.email);

  return result;
}

async function sendWhitelabelEmail (params) {
  try {
    validateInputParams(params);
    setDefaults(params);

    return await helperSendEmail(params);
  } catch (err) {
    log.error('sendWhitelabelEmail() failed to send email to %s. Err: %O', params.email, err.toString());
    throw err;
  }
}

module.exports = {
  sendWhitelabelEmail
};