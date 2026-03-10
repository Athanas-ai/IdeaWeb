import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { getAdminPassword } from "@shared/admin-auth";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Set up session for admin auth
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new SessionStore({
      checkPeriod: 86400000 
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || '9402'
  }));

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session?.authenticated) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Orders
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const ordersList = await storage.getOrders();
    res.json(ordersList);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.orders.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(id, input.status as any);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.orders.delete.path, requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Auth
  app.post(api.admin.login.path, async (req, res) => {
    try {
      const input = api.admin.login.input.parse(req.body);
      const adminPassword = getAdminPassword();
      
      if (input.password === adminPassword) {
        if (!req.session) {
          return res.status(500).json({ message: "Session configuration error" });
        }
        (req.session as any).authenticated = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      throw err;
    }
  });

  app.get(api.admin.checkAuth.path, async (req, res) => {
    if ((req.session as any)?.authenticated) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.post(api.admin.logout.path, async (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });

  // Seed data function
  async function seedDatabase() {
    const existingOrders = await storage.getOrders();
    if (existingOrders.length === 0) {
      await storage.createOrder({
        name: "Amjad",
        phone: "9876543210",
        idea: "A website where students can trade their used textbooks locally on campus. Needs a dark theme and quick chat feature."
      });
      await storage.createOrder({
        name: "Faris",
        phone: "9876543211",
        idea: "An interactive timeline for my college projects. Like a digital portfolio but with a 3D interface."
      });
    }
  }
  
  // Call seed function
  seedDatabase().catch(console.error);

  return httpServer;
}
