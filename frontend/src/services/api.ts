import axios from 'axios';
import { Graph, Node, Edge, BFSResult, ValidationResult } from '@/types/graph.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const graphApi = {
  createGraph: async (name: string, graphType: string) => {
    const response = await api.post('/api/graphs', { name, graph_type: graphType });
    return response.data;
  },

  getGraphs: async (): Promise<Graph[]> => {
    const response = await api.get('/api/graphs');
    return response.data;
  },

  getGraph: async (graphId: string): Promise<Graph> => {
    const response = await api.get(`/api/graphs/${graphId}`);
    return response.data;
  },

  updateGraph: async (graphId: string, graph: Graph): Promise<Graph> => {
    const response = await api.put(`/api/graphs/${graphId}`, graph);
    return response.data;
  },

  deleteGraph: async (graphId: string) => {
    const response = await api.delete(`/api/graphs/${graphId}`);
    return response.data;
  },

  addNode: async (graphId: string, node: Node): Promise<Graph> => {
    const response = await api.post(`/api/graphs/${graphId}/nodes`, node);
    return response.data;
  },

  removeNode: async (graphId: string, nodeId: string): Promise<Graph> => {
    const response = await api.delete(`/api/graphs/${graphId}/nodes/${nodeId}`);
    return response.data;
  },

  addEdge: async (graphId: string, edge: Edge): Promise<Graph> => {
    const response = await api.post(`/api/graphs/${graphId}/edges`, edge);
    return response.data;
  },

  removeEdge: async (graphId: string, edgeId: string): Promise<Graph> => {
    const response = await api.delete(`/api/graphs/${graphId}/edges/${edgeId}`);
    return response.data;
  },

  validateGraph: async (graphId: string): Promise<ValidationResult> => {
    const response = await api.post(`/api/graphs/${graphId}/validate`);
    return response.data;
  },

  runBFS: async (
    graphId: string,
    startNode: string,
    goalNode: string,
    orderType: string
  ): Promise<BFSResult> => {
    const response = await api.post(`/api/graphs/${graphId}/bfs`, {
      start_node: startNode,
      goal_node: goalNode,
      order_type: orderType,
    });
    return response.data;
  },

  importGraph: async (file: File): Promise<{ graph: Graph }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/graphs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  exportXML: async (graphId: string): Promise<Blob> => {
    const response = await api.get(`/api/graphs/${graphId}/export/xml`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportJSON: async (graphId: string): Promise<Blob> => {
    const response = await api.get(`/api/graphs/${graphId}/export/json`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportReport: async (
    graphId: string,
    bfsForward: BFSResult,
    bfsBackward?: BFSResult
  ): Promise<Blob> => {
    const response = await api.post(
      `/api/graphs/${graphId}/export/report`,
      {
        bfs_result_forward: bfsForward,
        bfs_result_backward: bfsBackward,
      },
      { responseType: 'blob' }
    );
    return response.data;
  },

  loadExampleGraph: async (exampleName: string): Promise<{ graph: Graph }> => {
    const response = await api.post(`/api/graphs/load-example/${exampleName}`);
    return response.data;
  },
};

export default api;
