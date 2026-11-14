import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { FavoriteService } from '../../../../../../core/favorite/services/favorite.service';
export declare class FavoritesCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    private readonly favoriteService;
    readonly type = "favorites";
    constructor(identity: SlackIdentityResolver, favoriteService: FavoriteService);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
