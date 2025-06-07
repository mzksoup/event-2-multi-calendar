import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to create event" 
        });
      }
    }
  });

  // Get event by share ID
  app.get("/api/events/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const event = await storage.getEventByShareId(shareId);
      
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  // Generate ICS file for event
  app.get("/api/events/:shareId/ics", async (req, res) => {
    try {
      const { shareId } = req.params;
      console.log("Generating ICS for shareId:", shareId);
      
      const event = await storage.getEventByShareId(shareId);
      console.log("Found event:", event);
      
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Parse date and time with proper validation
      const startDate = new Date(`${event.date}T${event.startTime}:00`);
      const endDate = new Date(`${event.date}T${event.endTime}:00`);
      
      console.log("Parsed dates:", { startDate, endDate });

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(`Invalid date/time: ${event.date} ${event.startTime}-${event.endTime}`);
      }

      // Format dates for ICS (YYYYMMDDTHHMMSSZ)
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Calendar Event Sharing//Calendar Event//EN',
        'BEGIN:VEVENT',
        `UID:${shareId}@calendar-app.com`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        `DTSTAMP:${formatICSDate(new Date())}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(line => line !== '').join('\r\n');

      console.log("Generated ICS content:", icsContent);

      res.setHeader('Content-Type', 'text/calendar');
      res.send(icsContent);
    } catch (error: any) {
      console.error("ICS generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate ICS file", 
        error: error?.message || String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
