import { FastifyReply, FastifyRequest } from 'fastify';
import { User, Workspace } from "../../database/types/entity.types";
import { McpToolsService } from './mcp-tools.service';
export declare class McpService {
    private readonly mcpToolsService;
    constructor(mcpToolsService: McpToolsService);
    handlePost(req: FastifyRequest, reply: FastifyReply, user: User, workspace: Workspace, oauthScopes?: string[]): Promise<void>;
    private createMcpServer;
}
