/**
 * Lexer for the Vivid Language (.vv)
 * Author: Suman Kumar Das
 */
export type TokenType = 'KEYWORD' | 'IDENTIFIER' | 'SNA_REF' | 'STRING' | 'NUMBER' | 'OPERATOR' | 'DELIMITER' | 'COMMENT' | 'EOF';
export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
export declare class VividLexer {
    private src;
    private pos;
    private line;
    private col;
    constructor(src: string);
    tokenize(): Token[];
    private skipWhitespace;
    private skipLineComment;
    private skipBlockComment;
    private readString;
    private readSnaRef;
    private readNumber;
    private readIdentifierOrKeyword;
    private isAlpha;
    private isDigit;
}
//# sourceMappingURL=lexer.d.ts.map