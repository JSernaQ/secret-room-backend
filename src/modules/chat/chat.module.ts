import { Module } from "@nestjs/common";
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { RateLimitEntryService } from './services/rate-limit-entry.service';

@Module({
  providers: [ChatGateway, ChatService, RateLimitEntryService]
})
export class ChatModule {}