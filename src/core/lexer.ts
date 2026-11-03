/**
 * Lexer for the Vivid Language (.vv)
 * Author: Suman Kumar Das
 */

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'SNA_REF'
  | 'STRING'
  | 'NUMBER'
  | 'OPERATOR'
  | 'DELIMITER'
  | 'COMMENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set([
  'module', 'intent', 'guard', 'model', 'lens', 'realize', 'store',
  'flow', 'atomic', 'ensure', 'never', 'require', 'sla', 'vibe',
  'actors', 'surface', 'theme', 'persisted', 'ephemeral', 'sync',
  'let', 'return', 'emit', 'if', 'else', 'true', 'false', 'ok', 'err'
]);

export class VividLexer {
  private src: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;

  constructor(src: string) {
    this.src = src;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.src.length) {
      this.skipWhitespace();
      if (this.pos >= this.src.length) break;

      const char = this.src[this.pos];

      // Comments
      if (char === '/' && this.src[this.pos + 1] === '/') {
        this.skipLineComment();
        continue;
      }
      if (char === '/' && this.src[this.pos + 1] === '*') {
        this.skipBlockComment();
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        tokens.push(this.readString(char));
        continue;
      }

      // Semantic Node Address @id
      if (char === '@') {
        tokens.push(this.readSnaRef());
        continue;
      }

      // Numbers
      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Identifiers & Keywords
      if (this.isAlpha(char) || char === '_') {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Two-character operators
      const twoChars = this.src.substring(this.pos, this.pos + 2);
      if (['->', '=>', '==', '!=', '<=', '>='].includes(twoChars)) {
        tokens.push({
          type: 'OPERATOR',
          value: twoChars,
          line: this.line,
          column: this.col
        });
        this.pos += 2;
        this.col += 2;
        continue;
      }

      // Single-character delimiters / operators
      if ('{}()[]:,;=<>?+-*/.!|&'.includes(char)) {
        tokens.push({
          type: 'DELIMITER',
          value: char,
          line: this.line,
          column: this.col
        });
        this.pos++;
        this.col++;
        continue;
      }

      // Fallback: advance unknown char
      this.pos++;
      this.col++;
    }

    tokens.push({
      type: 'EOF',
      value: '',
      line: this.line,
      column: this.col
    });

    return tokens;
  }

  private skipWhitespace() {
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (c === '\n') {
        this.line++;
        this.col = 1;
        this.pos++;
      } else if (/\s/.test(c)) {
        this.col++;
        this.pos++;
      } else {
        break;
      }
    }
  }

  private skipLineComment() {
    while (this.pos < this.src.length && this.src[this.pos] !== '\n') {
      this.pos++;
    }
  }

  private skipBlockComment() {
    this.pos += 2;
    while (this.pos < this.src.length) {
      if (this.src[this.pos] === '*' && this.src[this.pos + 1] === '/') {
        this.pos += 2;
        break;
      }
      if (this.src[this.pos] === '\n') {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
      this.pos++;
    }
  }

  private readString(quote: string): Token {
    const startCol = this.col;
    const startLine = this.line;
    this.pos++; // skip open quote
    this.col++;
    let val = '';

    while (this.pos < this.src.length && this.src[this.pos] !== quote) {
      if (this.src[this.pos] === '\\') {
        this.pos++;
        this.col++;
        val += this.src[this.pos] || '';
      } else {
        val += this.src[this.pos];
      }
      this.pos++;
      this.col++;
    }

    if (this.pos < this.src.length) {
      this.pos++; // skip close quote
      this.col++;
    }

    return {
      type: 'STRING',
      value: val,
      line: startLine,
      column: startCol
    };
  }

  private readSnaRef(): Token {
    const startCol = this.col;
    const startLine = this.line;
    let val = '@';
    this.pos++;
    this.col++;

    while (this.pos < this.src.length && /[a-zA-Z0-9_#-]/.test(this.src[this.pos])) {
      val += this.src[this.pos];
      this.pos++;
      this.col++;
    }

    return {
      type: 'SNA_REF',
      value: val,
      line: startLine,
      column: startCol
    };
  }

  private readNumber(): Token {
    const startCol = this.col;
    const startLine = this.line;
    let val = '';

    while (this.pos < this.src.length && /[0-9.]/.test(this.src[this.pos])) {
      val += this.src[this.pos];
      this.pos++;
      this.col++;
    }

    return {
      type: 'NUMBER',
      value: val,
      line: startLine,
      column: startCol
    };
  }

  private readIdentifierOrKeyword(): Token {
    const startCol = this.col;
    const startLine = this.line;
    let val = '';

    while (this.pos < this.src.length && /[a-zA-Z0-9_]/.test(this.src[this.pos])) {
      val += this.src[this.pos];
      this.pos++;
      this.col++;
    }

    const isKw = KEYWORDS.has(val);
    return {
      type: isKw ? 'KEYWORD' : 'IDENTIFIER',
      value: val,
      line: startLine,
      column: startCol
    };
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z]/.test(c);
  }

  private isDigit(c: string): boolean {
    return /[0-9]/.test(c);
  }
}
