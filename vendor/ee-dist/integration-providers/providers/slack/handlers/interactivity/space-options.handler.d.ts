import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { SpaceMemberRepo } from "../../../../../../database/repos/space/space-member.repo";
export declare class SpaceOptionsHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly spaceMemberRepo;
    readonly type = "block_suggestion:space_id";
    constructor(identity: SlackIdentityResolver, spaceMemberRepo: SpaceMemberRepo);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
