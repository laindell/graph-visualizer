export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  metadata?: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  directed: boolean;
  weight: number;
}

export enum GraphType {
  UNDIRECTED = 'undirected',
  DIRECTED = 'directed',
  TREE = 'tree',
  MIXED = 'mixed',
}

export interface Graph {
  id: string;
  name: string;
  nodes: Record<string, Node>;
  edges: Record<string, Edge>;
  graph_type: GraphType;
  adjacency_list: Record<string, string[]>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export enum BFSAction {
  VISIT = 'VISIT',
  ENQUEUE = 'ENQUEUE',
  COMPLETE = 'COMPLETE',
  NO_PATH = 'NO_PATH',
}

export interface BFSStep {
  step_number: number;
  current_node: string;
  queue: string[];
  visited: string[];
  parent: Record<string, string | null>;
  action: BFSAction;
}

export interface BFSResult {
  path: string[];
  path_length: number;
  steps_count: number;
  visited_nodes: number;
  execution_time_ms: number;
  start_node: string;
  goal_node: string;
  history: BFSStep[];
}

export interface BFSMetrics {
  current_step: number;
  total_steps: number;
  visited_count: number;
  queue_size: number;
}

export type OrderType = 'id_asc' | 'id_desc' | 'x_asc' | 'x_desc' | 'y_asc' | 'y_desc';
export type AlgorithmType = 'bfs' | 'dfs';

export interface BFSConfig {
  start_node: string;
  goal_node: string;
  order_type: OrderType;
  speed: number;
  algorithm_type: AlgorithmType;
}
