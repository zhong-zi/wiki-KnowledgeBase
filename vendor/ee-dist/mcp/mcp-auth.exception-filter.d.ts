import { ArgumentsHost, ExceptionFilter, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class McpAuthExceptionFilter implements ExceptionFilter {
    private readonly environmentService;
    private readonly logger;
    constructor(environmentService: EnvironmentService);
    catch(exception: UnauthorizedException | ForbiddenException, host: ArgumentsHost): void;
    private buildUnauthorizedChallenge;
}
