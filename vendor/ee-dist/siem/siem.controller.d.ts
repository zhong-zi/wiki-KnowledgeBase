import { User, Workspace } from "../../database/types/entity.types";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { SiemDestinationService } from './services/siem-destination.service';
import { CreateSiemDestinationDto, SiemDestinationIdDto, TestSiemDestinationDto, UpdateSiemDestinationDto } from './dto/siem-destination.dto';
export declare class SiemController {
    private readonly destinations;
    private readonly workspaceAbility;
    constructor(destinations: SiemDestinationService, workspaceAbility: WorkspaceAbilityFactory);
    list(user: User, workspace: Workspace): Promise<import("./siem.types").SiemDestinationView[]>;
    create(dto: CreateSiemDestinationDto, user: User, workspace: Workspace): Promise<import("./siem.types").SiemDestinationView>;
    update(dto: UpdateSiemDestinationDto, user: User, workspace: Workspace): Promise<import("./siem.types").SiemDestinationView>;
    remove(dto: SiemDestinationIdDto, user: User, workspace: Workspace): Promise<void>;
    retry(dto: SiemDestinationIdDto, user: User, workspace: Workspace): Promise<void>;
    test(dto: TestSiemDestinationDto, user: User, workspace: Workspace): Promise<import("./siem.types").SiemTestResult>;
    private assertOwner;
}
