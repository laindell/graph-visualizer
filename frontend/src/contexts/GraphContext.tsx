import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Graph, Node, Edge, GraphType } from '@/types/graph.types';
import { graphApi } from '@/services/api';

interface GraphContextType {
  graphs: Map<string, Graph>;
  activeGraphId: string | null;
  activeGraph: Graph | null;
  loading: boolean;
  error: string | null;
  setActiveGraphId: (id: string | null) => void;
  createGraph: (name: string, graphType: GraphType) => Promise<Graph>;
  loadGraphs: () => Promise<void>;
  updateGraph: (graph: Graph) => Promise<void>;
  deleteGraph: (graphId: string) => Promise<void>;
  addNode: (node: Node) => Promise<void>;
  removeNode: (nodeId: string) => Promise<void>;
  addEdge: (edge: Edge) => Promise<void>;
  removeEdge: (edgeId: string) => Promise<void>;
  importGraph: (file: File) => Promise<void>;
  loadExampleGraph: (exampleName: string) => Promise<void>;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graphs, setGraphs] = useState<Map<string, Graph>>(new Map());
  const [activeGraphId, setActiveGraphId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGraph = activeGraphId ? graphs.get(activeGraphId) || null : null;

  const loadGraphs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGraphs = await graphApi.getGraphs();
      const graphMap = new Map(fetchedGraphs.map(g => [g.id, g]));
      setGraphs(graphMap);

      if (!activeGraphId && fetchedGraphs.length > 0) {
        setActiveGraphId(fetchedGraphs[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load graphs');
    } finally {
      setLoading(false);
    }
  }, [activeGraphId]);

  const createGraph = useCallback(async (name: string, graphType: GraphType): Promise<Graph> => {
    setLoading(true);
    setError(null);
    try {
      const newGraph = await graphApi.createGraph(name, graphType);
      setGraphs(prev => new Map(prev).set(newGraph.id, newGraph));
      setActiveGraphId(newGraph.id);
      return newGraph;
    } catch (err: any) {
      setError(err.message || 'Failed to create graph');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGraph = useCallback(async (graph: Graph) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await graphApi.updateGraph(graph.id, graph);
      setGraphs(prev => new Map(prev).set(updated.id, updated));
    } catch (err: any) {
      setError(err.message || 'Failed to update graph');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGraph = useCallback(async (graphId: string) => {
    setLoading(true);
    setError(null);
    try {
      await graphApi.deleteGraph(graphId);
      setGraphs(prev => {
        const next = new Map(prev);
        next.delete(graphId);
        return next;
      });
      if (activeGraphId === graphId) {
        const remaining = Array.from(graphs.keys()).filter(id => id !== graphId);
        setActiveGraphId(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete graph');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeGraphId, graphs]);

  const addNode = useCallback(async (node: Node) => {
    if (!activeGraphId) return;
    setError(null);
    try {
      const updated = await graphApi.addNode(activeGraphId, node);
      setGraphs(prev => new Map(prev).set(updated.id, updated));
    } catch (err: any) {
      setError(err.message || 'Failed to add node');
      throw err;
    }
  }, [activeGraphId]);

  const removeNode = useCallback(async (nodeId: string) => {
    if (!activeGraphId) return;
    setError(null);
    try {
      const updated = await graphApi.removeNode(activeGraphId, nodeId);
      setGraphs(prev => new Map(prev).set(updated.id, updated));
    } catch (err: any) {
      setError(err.message || 'Failed to remove node');
      throw err;
    }
  }, [activeGraphId]);

  const addEdge = useCallback(async (edge: Edge) => {
    if (!activeGraphId) return;
    setError(null);
    try {
      const updated = await graphApi.addEdge(activeGraphId, edge);
      setGraphs(prev => new Map(prev).set(updated.id, updated));
    } catch (err: any) {
      setError(err.message || 'Failed to add edge');
      throw err;
    }
  }, [activeGraphId]);

  const removeEdge = useCallback(async (edgeId: string) => {
    if (!activeGraphId) return;
    setError(null);
    try {
      const updated = await graphApi.removeEdge(activeGraphId, edgeId);
      setGraphs(prev => new Map(prev).set(updated.id, updated));
    } catch (err: any) {
      setError(err.message || 'Failed to remove edge');
      throw err;
    }
  }, [activeGraphId]);

  const importGraph = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await graphApi.importGraph(file);
      setGraphs(prev => new Map(prev).set(result.graph.id, result.graph));
      setActiveGraphId(result.graph.id);
    } catch (err: any) {
      setError(err.message || 'Failed to import graph');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExampleGraph = useCallback(async (exampleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await graphApi.loadExampleGraph(exampleName);
      setGraphs(prev => new Map(prev).set(result.graph.id, result.graph));
      setActiveGraphId(result.graph.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load example graph');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphs();
  }, []);

  return (
    <GraphContext.Provider
      value={{
        graphs,
        activeGraphId,
        activeGraph,
        loading,
        error,
        setActiveGraphId,
        createGraph,
        loadGraphs,
        updateGraph,
        deleteGraph,
        addNode,
        removeNode,
        addEdge,
        removeEdge,
        importGraph,
        loadExampleGraph,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within GraphProvider');
  }
  return context;
};
