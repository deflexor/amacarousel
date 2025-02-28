// server/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes for Slides
app.get('/api/slides', async (req, res) => {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(slides);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

app.post('/api/slides', async (req, res) => {
  try {
    const { image, rating, review, username } = req.body;
    const slide = await prisma.slide.create({
      data: {
        image,
        rating: Number(rating),
        review,
        username
      }
    });
    
    // Emit socket event when a new slide is created
    io.emit('slideCreated', slide);
    
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slide' });
  }
});

app.put('/api/slides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, rating, review, username } = req.body;
    
    const slide = await prisma.slide.update({
      where: { id: Number(id) },
      data: {
        image,
        rating: Number(rating),
        review,
        username
      }
    });
    
    // Emit socket event when a slide is updated
    io.emit('slideUpdated', slide);
    
    res.json(slide);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

app.delete('/api/slides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.slide.delete({
      where: { id: Number(id) }
    });
    
    // Emit socket event when a slide is deleted
    io.emit('slideDeleted', Number(id));
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('carousel:next', () => {
    io.emit('carousel:next');
  });
  
  socket.on('carousel:prev', () => {
    io.emit('carousel:prev');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
