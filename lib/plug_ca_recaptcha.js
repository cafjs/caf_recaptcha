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
 * Calls an external app CA method.
 *
 *
 * @module caf_recaptcha/plug_ca_recaptcha
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
var caf_comp = require('caf_components');
var myUtils = caf_comp.myUtils;
var genPlugCA = caf_comp.gen_plug_ca;
var json_rpc = require('caf_transport').json_rpc;

exports.newInstance = async function($, spec) {
    try {
        var handleMethod = null;

        var that = genPlugCA.constructor($, spec);

        // transactional ops
        var target = {
            async validateImpl(id, recaptcha) {
                var result = [];
                try {
                    await $._.$.recaptcha.validate(recaptcha);
                } catch (err) {
                    result[0] = err;
                }
                if (handleMethod !== null) {
                    /* Response processed in a separate transaction, i.e.,
                     using a fresh message */
                    var m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                   handleMethod, id,
                                                   result);
                    $.ca.__ca_process__(m, function(err) {
                        err && $.ca.$.log &&
                            $.ca.$.log.error('Got handler exception ' +
                                             myUtils.errToPrettyStr(err));
                    });
                } else {
                    var logMsg = 'Ignoring reply ' + JSON.stringify(result);
                    $.ca.$.log && $.ca.$.log.warn(logMsg);
                }
                return [];
            },
            async setHandleReplyMethodImpl(methodName) {
                handleMethod = methodName;
                return [];
            }
        };

        that.__ca_setLogActionsTarget__(target);


        that.validate = function(recaptcha) {
            var id = myUtils.uniqueId();
            var allArgs = [id, recaptcha];
            that.__ca_lazyApply__('validateImpl', allArgs);
            return id;
        };

        that.setHandleReplyMethod = function(methodName) {
            that.__ca_lazyApply__('setHandleReplyMethodImpl', [methodName]);
        };

        that.getSiteKey = function() {
            return $._.$.recaptcha.getSiteKey();
        };

        that.dirtyValidate = function(recaptcha) {
            return $._.$.recaptcha.validate(recaptcha);
        };

        var super__ca_resume__ =
                myUtils.superiorPromisify(that, '__ca_resume__');
        that.__ca_resume__ = async function(cp) {
            try {
                handleMethod = cp.handleMethod;
                await super__ca_resume__(cp);
                return [];
            } catch (err) {
                return [err];
            }
        };

        var super__ca_prepare__ =
                myUtils.superiorPromisify(that, '__ca_prepare__');
        that.__ca_prepare__ = async function() {
            try {
                var data = await super__ca_prepare__();
                data.handleMethod = handleMethod;
                return [null, data];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
