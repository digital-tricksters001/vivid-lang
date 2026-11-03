/**
 * Model Context Protocol (MCP) Server for Vivid
 * Enables any AI editor (Cursor, Claude Desktop, Windsurf, VS Code) to
 * interact with Vivid AST, SNA graph, and Invariant verification tools.
 * Author: Suman Kumar Das
 */

import { VividLexer } from '../core/lexer.js';
import { VividParser } from '../core/parser.js';
import { SNAEngine } from '../core/sna.js';
import { InvariantVerifier } from '../core/invariants.js';

export class VividMCPServer {
  public static handleToolCall(toolName: string, args: Record<string, any>): any {
    switch (toolName) {
      case 'vivid_inspect_ast': {
        const { sourceCode } = args;
        const lexer = new VividLexer(sourceCode || '');
        const parser = new VividParser(lexer.tokenize());
        const program = parser.parse();
        const snaMap = SNAEngine.indexProgram(program);
        return {
          module: program.moduleName,
          nodesCount: program.nodes.length,
          snaGraph: snaMap
        };
      }

      case 'vivid_get_node': {
        const { sourceCode, nodeId } = args;
        const lexer = new VividLexer(sourceCode || '');
        const parser = new VividParser(lexer.tokenize());
        const program = parser.parse();
        const snaMap = SNAEngine.indexProgram(program);
        const node = snaMap[nodeId] || Object.values(snaMap).find(n => n.name === nodeId);
        return node || { error: `Node ${nodeId} not found` };
      }

      case 'vivid_verify_invariants': {
        const { sourceCode, guardName, mockState } = args;
        const lexer = new VividLexer(sourceCode || '');
        const parser = new VividParser(lexer.tokenize());
        const program = parser.parse();
        const guard = program.nodes.find(n => n.type === 'GuardDeclaration' && (n as any).name === guardName);

        if (!guard) {
          return { error: `Guard ${guardName} not found in program` };
        }

        return InvariantVerifier.verifyGuards(guard as any, mockState || {});
      }

      default:
        return { error: `Unknown Vivid MCP tool: ${toolName}` };
    }
  }

  public static listTools() {
    return [
      {
        name: 'vivid_inspect_ast',
        description: 'Parses a Vivid (.vv) file and returns its Semantic Node Address (SNA) map',
        inputSchema: {
          type: 'object',
          properties: { sourceCode: { type: 'string' } },
          required: ['sourceCode']
        }
      },
      {
        name: 'vivid_get_node',
        description: 'Retrieves a single semantic node by its SNA identifier (e.g. @cart_safety#9b3a)',
        inputSchema: {
          type: 'object',
          properties: {
            sourceCode: { type: 'string' },
            nodeId: { type: 'string' }
          },
          required: ['sourceCode', 'nodeId']
        }
      },
      {
        name: 'vivid_verify_invariants',
        description: 'Runs formal property checks on a Guard declaration and returns a MARP report if violated',
        inputSchema: {
          type: 'object',
          properties: {
            sourceCode: { type: 'string' },
            guardName: { type: 'string' },
            mockState: { type: 'object' }
          },
          required: ['sourceCode', 'guardName']
        }
      }
    ];
  }
}
