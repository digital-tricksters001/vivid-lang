/**
 * Parser for the Vivid Language (.vv)
 * Translates Token stream into structured VividProgram AST
 * Author: Suman Kumar Das
 */
import { Token } from './lexer.js';
import { VividProgram } from './ast.js';
export declare class VividParser {
    private tokens;
    private current;
    constructor(tokens: Token[]);
    parse(): VividProgram;
    private parseDeclaration;
    private parseIntent;
    private parseGuard;
    private parseModel;
    private parseLens;
    private parseRealize;
    private parseStore;
    private parseFlow;
    private peek;
    private isAtEnd;
    private advance;
    private check;
    private consume;
    private consumeIdentifier;
    private consumeString;
    private consumeStringOrNumber;
    private matchOptionalDelim;
    private parseIdentifierList;
    private consumeUntil;
}
//# sourceMappingURL=parser.d.ts.map