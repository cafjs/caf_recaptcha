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
 *  Proxy that allows a CA to validate a recaptcha token.
 *
 * @module caf_recaptcha/proxy_recaptcha
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Blocking validation of a recaptcha token.
         *
         * There is no checkpointing for this action, and this call may never
         * be executed if, e.g., the server fails.
         *
         * @param {string} recaptcha A key to be validated.
         *
         * @return {Promise<Object>}  A promise that we can `await` to
         * block further message processing. The promise is rejected with an
         * `Error` if the key
         * is not validated. The `Error` has a boolean field `isSystemError`
         * set to `true` when we could not validate the key, and `false`
         * when it was an invalid key.
         *
         * @memberof! module:caf_recaptcha/proxy_recaptcha#
         * @alias dirtyValidate
         */
        that.dirtyValidate = function(recaptcha) {
            return $._.dirtyValidate(recaptcha);
        };

        /**
         * Gets the site key.
         *
         * @return {string} A site key for recaptcha.
         *
         * @memberof! module:caf_recaptcha/proxy_recaptcha#
         * @alias getSiteKey
         */
        that.getSiteKey = function() {
            return $._.getSiteKey();
        };

        /**
         * Non-Blocking validation of a recaptcha token.
         *
         * The action is checkpointed first, executing at least once. Calls do
         * not block message processing for this CA, and responses can be
         * arbitrarily interleaved with new requests.
         *
         * The result of the validation is processed in a separate message with
         * the handle method previously set by `setHandleReplyMethod`.
         *
         * A unique id is returned to match responses.
         *
         * @param {string} recaptcha A key to be validated.
         *
         * @return {string} A unique identifier to match
         * replies for this request.
         *
         * @throws {Error} When there is no handleReply method set.
         *
         * @memberof! module:caf_recaptcha/proxy_recaptcha#
         * @alias validate
         */
        that.validate = function(recaptcha) {
            return $._.validate(recaptcha);
        };

        /**
         * Sets the name of the method in this CA that will process
         * reply `validate` messages.
         *
         * The type of the method is `async function(requestId, response)`
         *
         * where:
         *
         *  *  `requestId`: is an unique identifier to match the request.
         *  *  `response` is a tuple using the standard  `[Error, jsonType]`
         * CAF.js convention. The `Error` has a boolean field `isSystemError`
         * set to `true` when we could not validate the key, and `false`
         * when it was an invalid key.
         *
         * @param {string| null} methodName The name of this CA's method that
         *  process replies.
         *
         * @memberof! module:caf_recaptcha/proxy_recaptcha#
         * @alias setHandleReplyMethod
         *
         */
        that.setHandleReplyMethod = function(methodName) {
            $._.setHandleReplyMethod(methodName);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
