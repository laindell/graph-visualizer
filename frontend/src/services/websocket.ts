import { io, Socket } from 'socket.io-client';
import { BFSStep, BFSResult, BFSMetrics, AlgorithmType } from '@/types/graph.types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('bfs_step_update', (data: { step: BFSStep; metrics: BFSMetrics }) => {
      this.emit('bfs_step_update', data);
    });

    this.socket.on('bfs_complete', (data: { result: BFSResult }) => {
      this.emit('bfs_complete', data);
    });

    this.socket.on('bfs_error', (data: { error: string }) => {
      this.emit('bfs_error', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  startBFS(graphId: string, startNode: string, goalNode: string, orderType: string, speed: number, algorithmType: AlgorithmType = 'bfs'): void {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit('bfs_start', {
      graph_id: graphId,
      start_node: startNode,
      goal_node: goalNode,
      order_type: orderType,
      speed,
      algorithm_type: algorithmType,
    });
  }

  pauseBFS(): void {
    if (this.socket?.connected) {
      this.socket.emit('bfs_pause', {});
    }
  }

  resumeBFS(): void {
    if (this.socket?.connected) {
      this.socket.emit('bfs_resume', {});
    }
  }

  stopBFS(): void {
    if (this.socket?.connected) {
      this.socket.emit('bfs_stop', {});
    }
  }

  stepBFS(direction: 'forward' | 'backward'): void {
    if (this.socket?.connected) {
      this.socket.emit('bfs_step', { direction });
    }
  }

  seekBFS(stepNumber: number): void {
    if (this.socket?.connected) {
      this.socket.emit('bfs_seek', { step_number: stepNumber });
    }
  }
}

export const wsService = new WebSocketService();
