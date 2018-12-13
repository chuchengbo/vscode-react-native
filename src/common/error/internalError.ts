// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

export enum InternalErrorLevel {
    Error,
    Warning,
}

export interface IInternalErrorArgument {
    argument: any;
    isPii: boolean;
}

export class InternalError extends Error {
    public errorCode: number;
    public errorLevel: InternalErrorLevel;
    public errorArgs: IInternalErrorArgument[];

    public get isInternalError(): boolean {
        return true;
    }

    constructor(errorCode: number, message: string, errorLevel: InternalErrorLevel = InternalErrorLevel.Error, errorArgs: IInternalErrorArgument[]) {
        super(message);
        this.errorCode = errorCode;
        this.errorLevel = errorLevel;
        this.message = message + ` (error code ${this.errorCode})`;
        this.errorArgs = errorArgs;
    }
}

export class NestedError extends InternalError {
    public innerError: Error | any; // Normally this should be an error, but we support any value

    constructor(errorCode: number, message: string, innerError: any = null, errorArgs: IInternalErrorArgument[], errorLevel: InternalErrorLevel = InternalErrorLevel.Error) {
        super(errorCode, message, errorLevel, errorArgs);
        this.innerError = innerError;
        this.name = innerError ? innerError.name : null;
        const innerMessage = innerError ? innerError.message : null;
        this.message = innerMessage ? `${message}: ${innerMessage}` : message;
    }

    public static getWrappedError(error: InternalError, innerError: any): NestedError {
        return new NestedError(innerError.errorCode || error.errorCode, error.message, innerError, []);
    }
}
