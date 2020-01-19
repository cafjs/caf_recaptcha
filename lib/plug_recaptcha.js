/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
/**
 * Calls an external service to validate recaptchas.
 *
 *  Properties:
 *
 *       {keysDir: string=, privateKeyFile: string, publicKeyFile: string}
 *
 * where:
 *
 * * `keysDir:` directory for all key material.
 * * `publicKeyFile`: a public key to interact with the service.
 * * `privateKeyFile`: a secret key to interact with the service.
 *
 * @module caf_recaptcha/plug_recaptcha
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const assert = require('assert');
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;

const path = require('path');
const fs = require('fs');
const reCAPTCHA = require('recaptcha2');

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.constructor($, spec);

        $._.$.log && $._.$.log.debug('New recaptcha plug');

        const keysDir = spec.env.keysDir || $.loader.__ca_firstModulePath__();

        const loadKey = function(fileName) {
            if (fileName) {
                const buf = fs.readFileSync(path.resolve(keysDir, fileName));
                return buf.toString('utf8').trim();
            } else {
                return null;
            }
        };

        assert.equal(typeof spec.env.privateKeyFile, 'string',
                     "'spec.env.privateKeyFile' is not a string");
        const privateKey = loadKey(spec.env.privateKeyFile);

        assert.equal(typeof spec.env.publicKeyFile, 'string',
                     "'spec.env.publicKeyFile' is not a string");
        const publicKey = loadKey(spec.env.publicKeyFile);


        that.getSiteKey = function() {
            return publicKey;
        };

        that.validate = function(recaptcha) {
            const rec = new reCAPTCHA({
                siteKey: publicKey,
                secretKey: privateKey
            });
            return new Promise((resolve, reject) => {
                rec.validate(recaptcha)
                    .then(() => resolve(true))
                    .catch((errorCodes) => {
                        const error = new Error('Invalid captcha');
                        error['errorCodes'] = errorCodes;
                        if (Array.isArray(errorCodes) &&
                            (errorCodes[0] === 'request-error')) {
                            error['isSystemError'] = true;
                        }
                        error['errorMsg'] =
                            JSON.stringify(rec.translateErrors(errorCodes));
                        reject(error);
                    });
            });
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
