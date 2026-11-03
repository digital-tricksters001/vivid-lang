/**
 * Model Context Protocol (MCP) Server for Vivid
 * Enables any AI editor (Cursor, Claude Desktop, Windsurf, VS Code) to
 * interact with Vivid AST, SNA graph, and Invariant verification tools.
 * Author: Suman Kumar Das
 */
export declare class VividMCPServer {
    static handleToolCall(toolName: string, args: Record<string, any>): any;
    static listTools(): ({
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                sourceCode: {
                    type: string;
                };
                nodeId?: undefined;
                guardName?: undefined;
                mockState?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                sourceCode: {
                    type: string;
                };
                nodeId: {
                    type: string;
                };
                guardName?: undefined;
                mockState?: undefined;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                nodeId?: undefined;
                sourceCode: {
                    type: string;
                };
                guardName: {
                    type: string;
                };
                mockState: {
                    type: string;
                };
            };
            required: string[];
        };
    })[];
}
//# sourceMappingURL=mcp.d.ts.map