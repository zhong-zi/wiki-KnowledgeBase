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
exports.SlackPageWriter = void 0;
const common_1 = require("@nestjs/common");
const page_service_1 = require("../../../../../core/page/services/page.service");
const PLACEMENT_TO_OPERATION = {
    top: 'prepend',
    bottom: 'append',
};
let SlackPageWriter = class SlackPageWriter {
    constructor(pageService) {
        this.pageService = pageService;
    }
    async appendToPage(pageId, markdown, placement, user) {
        const operation = PLACEMENT_TO_OPERATION[placement];
        await this.pageService.updatePageContent(pageId, markdown, operation, 'markdown', user);
    }
};
exports.SlackPageWriter = SlackPageWriter;
exports.SlackPageWriter = SlackPageWriter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [page_service_1.PageService])
], SlackPageWriter);
//# sourceMappingURL=slack-page-writer.service.js.map