/*
 * Copyright (c) 2019 TIS Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* globals MashupPlatform */

(function () {

    "use strict";

    /* *****************************************************************************/
    /* ******************************** PUBLIC *************************************/
    /* *****************************************************************************/

    var id1 = "dummyEntity01";
    var id2 = "dummyEntity02";
    var historySize = 60;

    var DummyNGSISource = function DummyNGSISource() {
        this.refresh_interval = null;
        this.historicalData = {};
    };

    DummyNGSISource.prototype.init = function init() {
        console.log("DummyNGSISource#init()");
        // Set preference callbacks
        MashupPlatform.prefs.registerCallback(handlerPreferences.bind(this));

        // Set wiring status callback
        MashupPlatform.wiring.registerStatusCallback(doInitialize.bind(this));

        // Set beforeunload listener
        window.addEventListener("beforeunload", () => {
            console.log("DummyNGSISource#beforeunload");
        });

        this.historicalData[id1] = new Array(historySize).fill(null);
        this.historicalData[id2] = new Array(historySize).fill(null);

        doInitialize.call(this);
    };

    /* *****************************************************************************/
    /* ******************************** PRIVATE ************************************/
    /* *****************************************************************************/

    var handlerPreferences = function handlerPreferences(new_values) {
        console.log("DummyNGSISource#handlePreferences", new_values);
        doInitialize.call(this);
    };

    var doInitialize = function doInitialize() {
        console.log("DummyNGSISource#doInitialize()");
        if (!MashupPlatform.operator.outputs.entityOutput.connected || !MashupPlatform.prefs.get('generating')) {
            console.log("DummyNGSISource - stop generating");
            if (this.refresh_interval) {
                console.log("DummyNGSISource - clear interval");
                clearInterval(this.refresh_interval);
                this.refresh_interval = null;
            }
            return;
        }

        startGenerating.call(this);
    };

    var startGenerating = function startGenerating() {
        if (!this.refresh_interval) {
            console.log("DummyNGSISource#startGenerating()");
            this.refresh_interval = setInterval(generate.bind(this), 1000);
        }
    };

    var generate = function generate() {
        var t1 = Math.random() + 24;
        var t2 = Math.random() + 18;
        var entities = [
            {
                "id": id1,
                "type": "DummyEntity",
                "latitude": 35.696138,
                "longitude": 139.691224,
                "temperature": t1
            }, {
                "id": id2,
                "type": "DummyEntity",
                "latitude": 35.692172,
                "longitude": 139.688754,
                "temperature": t2
            }
        ];
        localStorage.setItem(id1, getHistoricalDataStr.call(this, id1, t1));
        localStorage.setItem(id2, getHistoricalDataStr.call(this, id2, t2));

        MashupPlatform.wiring.pushEvent("entityOutput", entities);
        console.log("DummyNGSISource - push entities=", entities);
    };

    var getHistoricalDataStr = function getHistoricalDataStr(id, t) {
        this.historicalData[id].shift();
        this.historicalData[id].push(t);
        return JSON.stringify(this.historicalData[id]);
    };

    /* *****************************************************************************/
    /* ********************************  main  *************************************/
    /* *****************************************************************************/

    var dummyNgsiSource = new DummyNGSISource();
    window.addEventListener("DOMContentLoaded", dummyNgsiSource.init.bind(dummyNgsiSource), false);

})();
