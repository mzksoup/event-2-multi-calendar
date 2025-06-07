import { events, type Event, type InsertEvent } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  createEvent(event: InsertEvent): Promise<Event>;
  getEventByShareId(shareId: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private currentId: number;

  constructor() {
    this.events = new Map();
    this.currentId = 1;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const shareId = nanoid(10);
    const event: Event = { 
      ...insertEvent, 
      id, 
      shareId,
      duration: insertEvent.duration || 60
    };
    this.events.set(shareId, event);
    return event;
  }

  async getEventByShareId(shareId: string): Promise<Event | undefined> {
    return this.events.get(shareId);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
}

export const storage = new MemStorage();
