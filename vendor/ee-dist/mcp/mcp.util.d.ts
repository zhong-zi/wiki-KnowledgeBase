import { FastifyRequest } from 'fastify';
import { Workspace } from "../../database/types/entity.types";
export declare function isMcpEnabled(workspace: Workspace | undefined): boolean;
export declare function isMcpOauthEnforced(workspace: Workspace | undefined): boolean;
export declare function toWebRequest(req: FastifyRequest): Request;
