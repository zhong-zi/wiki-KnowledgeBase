import { CanActivate, ExecutionContext } from '@nestjs/common';
import { EnvironmentService } from '../../../../../integrations/environment/environment.service';
export declare class SlackSignatureGuard implements CanActivate {
    private readonly environmentService;
    constructor(environmentService: EnvironmentService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
