import { PageService } from '../../../../../core/page/services/page.service';
import { User } from "../../../../../database/types/entity.types";
export type Placement = 'top' | 'bottom';
export declare class SlackPageWriter {
    private readonly pageService;
    constructor(pageService: PageService);
    appendToPage(pageId: string, markdown: string, placement: Placement, user: User): Promise<void>;
}
