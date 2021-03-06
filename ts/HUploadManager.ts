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

import { HRequest } from "./HRequest";
import { PromReject, PromResolve } from "@elijahjcobb/prom-type";
import * as HTTP from "http";
import { HError } from "./HError";
import * as FS from "fs";
import * as Crypto from "crypto";

export enum HUploadManagerLocation {
	PAYLOAD,
	STREAM
}

export type HUploadManagerConstructorType = {
	location: HUploadManagerLocation;
	extensions?: string[];
	sizeLimit?: number;
};

export class HUploadManager {

	private readonly allowedExtensions?: string[];
	private readonly sizeLimit?: number;
	private readonly location: HUploadManagerLocation;

	public constructor(obj: HUploadManagerConstructorType) {

		this.allowedExtensions = obj.extensions;
		this.sizeLimit = obj.sizeLimit;
		this.location = obj.location;

	}

	private throwFileIncorrectType(): void {

		if (this.allowedExtensions !== undefined) {
			throw HError.init()
				.code(415)
				.msg(`File incorrect format. Set correct 'content-type'. Valid types are ${this.allowedExtensions.join(", ")}.`)
				.show();
		}

	}

	private getNewFilePath(): string {

		let name: string = Crypto.randomBytes(8).toString("hex");
		while (FS.existsSync(`/tmp/${name}`)) name = Crypto.randomBytes(8).toString("hex");

		return `/tmp/${name}`;

	}

	public getAllowedExtensions(): string[] | undefined { return this.allowedExtensions; }
	public getSizeLimit(): number | undefined { return this.sizeLimit; }
	public getLocation(): HUploadManagerLocation { return this.location; }

	public async handleRequest(req: HRequest): Promise<void> {

		return new Promise<void>(((resolve: PromResolve<void>, reject: PromReject): void => {

			const request: HTTP.IncomingMessage = req.getRequest();

			if (this.allowedExtensions !== undefined) {

				const mime: string | undefined =  req.getHeaders()["content-type"];

				if (mime === undefined || this.allowedExtensions.indexOf(mime) === -1) this.throwFileIncorrectType();

			}

			if (this.sizeLimit !== undefined) {

				const contentLength: string | undefined = req.getHeaders()["content-length"];

				if (contentLength !== undefined) {

					const lengthNum: number = parseInt(contentLength);
					if (!isNaN(lengthNum) && lengthNum > this.sizeLimit) return reject(HError.init().code(413).msg(`File too large. Limited to ${this.sizeLimit} bytes.`).show());

				}

			}

			if (this.location === HUploadManagerLocation.PAYLOAD) {

				let payload: Buffer = Buffer.alloc(0, 0);
				request.on("data", (chunk: Buffer): void => {

					payload = Buffer.concat([payload, chunk]);

					if (this.sizeLimit !== undefined && payload.length > this.sizeLimit) return reject(HError.init().code(413).msg(`File too large. Limited to ${this.sizeLimit} bytes.`).show());

				});

				request.on("end", (): void => {

					req.setPayload(payload);

					resolve();

				});

			} else if (this.location === HUploadManagerLocation.STREAM) {


				const filePath: string = this.getNewFilePath();
				const writeStream: FS.WriteStream = FS.createWriteStream(filePath);

				let length: number = 0;

				request.on("data", (chunk: Buffer): void => {

					length += chunk.length;
					writeStream.write(chunk);

					if (this.sizeLimit !== undefined && length > this.sizeLimit) {
						return reject(HError.init().code(413).msg(`File too large. Limited to ${this.sizeLimit} bytes.`).show());
					}

				});

				request.on("end", (): void => {

					req.setPayloadStreamPath(filePath);
					writeStream.end();
					resolve();

				});

			}

		}));

	}

}