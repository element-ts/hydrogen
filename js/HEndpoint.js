"use strict";
/**
 * Copyright 2019
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://github.com/elijahjcobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * ORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const HUploadManager_1 = require("./HUploadManager");
class HEndpoint {
    constructor(endpoint, obj) {
        this.endpoint = endpoint;
        this.method = obj.method;
        this.handler = obj.handler;
        this.requiredType = obj.types;
        if (obj.upload)
            this.uploadManager = new HUploadManager_1.HUploadManager(obj.upload);
    }
    getEndpoint() { return this.endpoint; }
    getMethod() { return this.method; }
    getHandler() { return this.handler; }
    getRequiredType() { return this.requiredType; }
    getUploadManager() { return this.uploadManager; }
}
exports.HEndpoint = HEndpoint;
//# sourceMappingURL=HEndpoint.js.map