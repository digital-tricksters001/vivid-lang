/**
 * Parser for the Vivid Language (.vv)
 * Translates Token stream into structured VividProgram AST
 * Author: Suman Kumar Das
 */
import { SNAEngine } from './sna.js';
export class VividParser {
    tokens;
    current = 0;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        let moduleName = 'Main';
        if (this.check('KEYWORD', 'module')) {
            this.advance();
            if (this.peek().type === 'IDENTIFIER') {
                moduleName = this.advance().value;
            }
            this.matchOptionalDelim(';');
        }
        const declarations = [];
        while (!this.isAtEnd()) {
            const decl = this.parseDeclaration();
            if (decl) {
                declarations.push(decl);
            }
            else {
                this.advance(); // Skip unexpected token safely
            }
        }
        const program = {
            type: 'Program',
            moduleName,
            nodes: declarations
        };
        // Calculate SNA IDs and hashes immediately
        SNAEngine.indexProgram(program);
        return program;
    }
    parseDeclaration() {
        const token = this.peek();
        if (token.type === 'KEYWORD') {
            switch (token.value) {
                case 'intent':
                    return this.parseIntent();
                case 'guard':
                    return this.parseGuard();
                case 'model':
                    return this.parseModel();
                case 'lens':
                    return this.parseLens();
                case 'realize':
                    return this.parseRealize();
                case 'store':
                    return this.parseStore();
                case 'flow':
                    return this.parseFlow();
            }
        }
        return null;
    }
    parseIntent() {
        this.advance(); // consume 'intent'
        const name = this.consumeIdentifier('Intent name expected');
        this.consume('{', "Expected '{' after intent name");
        let vibe;
        let actors;
        let sla;
        const constraints = [];
        let rawPrompt;
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            if (this.check('STRING')) {
                // Plain prompt intent block
                rawPrompt = this.advance().value;
                continue;
            }
            if (this.check('KEYWORD', 'vibe') || this.check('IDENTIFIER', 'vibe')) {
                this.advance();
                this.matchOptionalDelim(':');
                vibe = this.consumeString('Vibe description expected');
                continue;
            }
            if (this.check('KEYWORD', 'actors') || this.check('IDENTIFIER', 'actors')) {
                this.advance();
                this.matchOptionalDelim(':');
                actors = this.parseIdentifierList();
                continue;
            }
            if (this.check('KEYWORD', 'sla') || this.check('IDENTIFIER', 'sla')) {
                this.advance();
                this.matchOptionalDelim(':');
                sla = this.consumeStringOrNumber();
                continue;
            }
            // Collect generic constraint lines
            const line = this.consumeUntil(['}', '\n', ';']);
            if (line.trim())
                constraints.push(line.trim());
        }
        this.consume('}', "Expected '}' closing intent block");
        return {
            type: 'IntentDeclaration',
            name,
            vibe,
            actors,
            sla,
            constraints,
            rawPrompt
        };
    }
    parseGuard() {
        this.advance(); // consume 'guard'
        const name = this.consumeIdentifier('Guard name expected');
        this.consume('{', "Expected '{' after guard name");
        const invariants = [];
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            const token = this.peek();
            if (['ensure', 'never', 'require', 'sla'].includes(token.value)) {
                const kind = this.advance().value;
                let expr = '';
                while (!this.isAtEnd() && ![';', '}'].includes(this.peek().value)) {
                    if (['ensure', 'never', 'require', 'sla'].includes(this.peek().value)) {
                        break;
                    }
                    expr += this.advance().value + ' ';
                }
                this.matchOptionalDelim(';');
                invariants.push({
                    kind,
                    expression: expr.trim()
                });
            }
            else {
                this.advance();
            }
        }
        this.consume('}', "Expected '}' closing guard block");
        return {
            type: 'GuardDeclaration',
            name,
            invariants
        };
    }
    parseModel() {
        this.advance(); // consume 'model'
        const name = this.consumeIdentifier('Model name expected');
        this.consume('{', "Expected '{' after model name");
        const fields = [];
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            if (this.peek().type === 'IDENTIFIER') {
                const fieldName = this.advance().value;
                this.consume(':', "Expected ':' after field name");
                const typeToken = this.advance();
                const fieldType = typeToken.value;
                // Check for inline constraint, e.g. > 0, >= 1, email()
                let constraint;
                if (!['\n', ';', '}', ','].includes(this.peek().value)) {
                    constraint = this.consumeUntil(['\n', ';', '}', ',']).trim();
                }
                this.matchOptionalDelim(';');
                this.matchOptionalDelim(',');
                fields.push({
                    name: fieldName,
                    fieldType,
                    constraint
                });
            }
            else {
                this.advance();
            }
        }
        this.consume('}', "Expected '}' closing model block");
        return {
            type: 'ModelDeclaration',
            name,
            fields
        };
    }
    parseLens() {
        this.advance(); // consume 'lens'
        const name = this.consumeIdentifier('Lens name expected');
        // Params (e.g. cart: CartItem[])
        const params = [];
        if (this.check('DELIMITER', '(')) {
            this.advance();
            while (!this.check('DELIMITER', ')') && !this.isAtEnd()) {
                const pName = this.consumeIdentifier('Parameter name expected');
                this.consume(':', "Expected ':'");
                const pType = this.consumeUntil([',', ')']).trim();
                params.push({ name: pName, type: pType });
                this.matchOptionalDelim(',');
            }
            this.consume(')', "Expected ')'");
        }
        this.consume('{', "Expected '{' after lens signature");
        let theme;
        const elements = [];
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            if (this.check('KEYWORD', 'surface') || this.check('IDENTIFIER', 'surface')) {
                this.advance();
                this.consume('{', "Expected '{' after surface");
                while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
                    const key = this.peek().value;
                    this.advance();
                    this.matchOptionalDelim(':');
                    const value = this.consumeUntil(['\n', ';', '}']).trim();
                    this.matchOptionalDelim(';');
                    elements.push({
                        key,
                        value,
                        isAction: value.includes('action(')
                    });
                }
                this.consume('}', "Expected '}' closing surface");
            }
            else if (this.check('KEYWORD', 'theme') || this.check('IDENTIFIER', 'theme')) {
                this.advance();
                this.matchOptionalDelim(':');
                theme = this.consumeUntil(['\n', ';', '}']).trim();
            }
            else {
                this.advance();
            }
        }
        this.consume('}', "Expected '}' closing lens block");
        return {
            type: 'LensDeclaration',
            name,
            params,
            elements,
            theme
        };
    }
    parseRealize() {
        this.advance(); // consume 'realize'
        const targetNodeId = this.peek().type === 'SNA_REF' || this.peek().type === 'IDENTIFIER'
            ? this.advance().value
            : '@anonymous';
        this.consume('{', "Expected '{' after realize target");
        const flows = [];
        let bodyBuffer = '';
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            if (this.check('KEYWORD', 'flow')) {
                flows.push(this.parseFlow());
            }
            else {
                bodyBuffer += this.advance().value + ' ';
            }
        }
        this.consume('}', "Expected '}' closing realize block");
        return {
            type: 'RealizeDeclaration',
            targetNodeId,
            body: bodyBuffer.trim(),
            flows
        };
    }
    parseStore() {
        this.advance(); // consume 'store'
        const name = this.consumeIdentifier('Store name expected');
        this.consume('{', "Expected '{' after store name");
        const persistedFields = [];
        const ephemeralFields = [];
        const syncOptions = [];
        while (!this.check('DELIMITER', '}') && !this.isAtEnd()) {
            if (this.check('KEYWORD', 'persisted') || this.check('IDENTIFIER', 'persisted')) {
                this.advance();
                const fName = this.consumeIdentifier('Persisted field name expected');
                this.consume(':', "Expected ':'");
                const fType = this.consumeUntil(['\n', ';', '}']).trim();
                persistedFields.push({ name: fName, fieldType: fType });
            }
            else if (this.check('KEYWORD', 'ephemeral') || this.check('IDENTIFIER', 'ephemeral')) {
                this.advance();
                const fName = this.consumeIdentifier('Ephemeral field name expected');
                this.consume(':', "Expected ':'");
                const fType = this.consumeUntil(['\n', ';', '}']).trim();
                ephemeralFields.push({ name: fName, fieldType: fType });
            }
            else if (this.check('KEYWORD', 'sync') || this.check('IDENTIFIER', 'sync')) {
                this.advance();
                this.matchOptionalDelim(':');
                const opts = this.parseIdentifierList();
                syncOptions.push(...opts);
            }
            else {
                this.advance();
            }
        }
        this.consume('}', "Expected '}' closing store block");
        return {
            type: 'StoreDeclaration',
            name,
            persistedFields,
            ephemeralFields,
            syncOptions
        };
    }
    parseFlow() {
        this.advance(); // consume 'flow'
        const name = this.consumeIdentifier('Flow name expected');
        // Params
        const params = [];
        if (this.check('DELIMITER', '(')) {
            this.advance();
            while (!this.check('DELIMITER', ')') && !this.isAtEnd()) {
                const pName = this.consumeIdentifier('Param name expected');
                this.consume(':', "Expected ':'");
                const pType = this.consumeUntil([',', ')']).trim();
                params.push({ name: pName, type: pType });
                this.matchOptionalDelim(',');
            }
            this.consume(')', "Expected ')'");
        }
        let returnType = 'Void';
        if (this.check('OPERATOR', '->')) {
            this.advance();
            returnType = this.consumeUntil(['{']).trim();
        }
        this.consume('{', "Expected '{' before flow body");
        let depth = 1;
        let body = '';
        while (depth > 0 && !this.isAtEnd()) {
            const tok = this.advance();
            if (tok.value === '{')
                depth++;
            else if (tok.value === '}') {
                depth--;
                if (depth === 0)
                    break;
            }
            body += tok.value + ' ';
        }
        return {
            type: 'FlowDeclaration',
            name,
            params,
            returnType,
            body: body.trim(),
            isAtomic: body.includes('atomic')
        };
    }
    // --- Helpers ---
    peek() {
        return this.tokens[this.current] || { type: 'EOF', value: '', line: 0, column: 0 };
    }
    isAtEnd() {
        return this.peek().type === 'EOF';
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.tokens[this.current - 1];
    }
    check(type, value) {
        const p = this.peek();
        if (p.type !== type)
            return false;
        if (value !== undefined && p.value !== value)
            return false;
        return true;
    }
    consume(expectedValue, errMsg) {
        if (this.peek().value === expectedValue) {
            return this.advance();
        }
        throw new Error(`Vivid Parse Error [L${this.peek().line}:C${this.peek().column}]: ${errMsg}. Got '${this.peek().value}'`);
    }
    consumeIdentifier(errMsg) {
        if (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD') {
            return this.advance().value;
        }
        throw new Error(`Vivid Parse Error: ${errMsg}. Got '${this.peek().value}'`);
    }
    consumeString(errMsg) {
        if (this.peek().type === 'STRING') {
            return this.advance().value;
        }
        throw new Error(`Vivid Parse Error: ${errMsg}`);
    }
    consumeStringOrNumber() {
        if (this.peek().type === 'STRING' || this.peek().type === 'NUMBER' || this.peek().type === 'IDENTIFIER') {
            return this.advance().value;
        }
        return '';
    }
    matchOptionalDelim(delim) {
        if (this.peek().value === delim) {
            this.advance();
        }
    }
    parseIdentifierList() {
        const list = [];
        if (this.check('DELIMITER', '[')) {
            this.advance();
            while (!this.check('DELIMITER', ']') && !this.isAtEnd()) {
                if (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD') {
                    list.push(this.advance().value);
                }
                this.matchOptionalDelim(',');
            }
            this.consume(']', "Expected ']'");
        }
        return list;
    }
    consumeUntil(stopChars) {
        let result = '';
        while (!this.isAtEnd() && !stopChars.includes(this.peek().value)) {
            result += this.advance().value + ' ';
        }
        return result;
    }
}
//# sourceMappingURL=parser.js.map