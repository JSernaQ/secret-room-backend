import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

interface RateLimitEntry {
    count: number,
    lastReset: number,
}

@Injectable()
export class RateLimitEntryService implements OnModuleInit, OnModuleDestroy{

    private readonly limits = new Map<string, RateLimitEntry>();

    private readonly WINDOW_MS = 10_000;
    private readonly MAX_EVENTS = 15;

    private cleanUpInterval?: ReturnType<typeof setInterval>;

    onModuleInit() {
        this.cleanUpInterval = setInterval(() => {
            this.cleanUp();
        }, 30_000)
    }

    onModuleDestroy() {
        clearInterval(this.cleanUpInterval)
    }

    isAllowed(key: string) {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry) {
            this.limits.set(key, { count: 1, lastReset: now });
            return true;
        }
        if (now - entry.lastReset > this.WINDOW_MS) {
            entry.count = 1;
            entry.lastReset = now;
            return true;
        }
        
        if (entry.count >= this.MAX_EVENTS) {
            return false;
        }
        entry.count++;
        return true;
    }

    cleanUp() {
        if (this.limits.size === 0) return;

        const now = Date.now();
        for (const [key, entry] of this.limits) {
            if (now - entry.lastReset > this.WINDOW_MS * 2) { 
                this.limits.delete(key);
            }
        }
    }

}
