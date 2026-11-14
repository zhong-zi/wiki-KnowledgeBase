"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpService = void 0;
const common_1 = require("@nestjs/common");
const server_1 = require("@modelcontextprotocol/server");
const mcp_tools_service_1 = require("./mcp-tools.service");
const mcp_util_1 = require("./mcp.util");
let McpService = class McpService {
    constructor(mcpToolsService) {
        this.mcpToolsService = mcpToolsService;
    }
    async handlePost(req, reply, user, workspace, oauthScopes) {
        const transport = new server_1.WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        const server = this.createMcpServer(user, workspace, oauthScopes);
        await server.connect(transport);
        try {
            const response = await transport.handleRequest((0, mcp_util_1.toWebRequest)(req), {
                parsedBody: req.body,
            });
            await reply.send(response);
        }
        finally {
            await transport.close();
            await server.close();
        }
    }
    createMcpServer(user, workspace, oauthScopes) {
        const server = new server_1.McpServer({
            name: 'docmost',
            version: '1.0.0',
        });
        this.mcpToolsService.registerTools(server, user, workspace, oauthScopes);
        return server;
    }
};
exports.McpService = McpService;
exports.McpService = McpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_tools_service_1.McpToolsService])
], McpService);
//# sourceMappingURL=mcp.service.js.map