import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BFSResult, BFSStep, BFSMetrics, BFSConfig, OrderType, AlgorithmType } from '@/types/graph.types';
import { wsService } from '@/services/websocket';

interface BFSContextType {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  result: BFSResult | null;
  currentStepData: BFSStep | null;
  metrics: BFSMetrics | null;
  config: BFSConfig | null;
  error: string | null;
  startBFS: (graphId: string, startNode: string, goalNode: string, orderType: OrderType, speed: number, algorithmType?: AlgorithmType) => void;
  pauseBFS: () => void;
  resumeBFS: () => void;
  stopBFS: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  seekToStep: (step: number) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

const BFSContext = createContext<BFSContextType | undefined>(undefined);

export const BFSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [result, setResult] = useState<BFSResult | null>(null);
  const [currentStepData, setCurrentStepData] = useState<BFSStep | null>(null);
  const [metrics, setMetrics] = useState<BFSMetrics | null>(null);
  const [config, setConfig] = useState<BFSConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    wsService.connect();

    const handleStepUpdate = (data: { step: BFSStep; metrics: BFSMetrics }) => {
      setCurrentStepData(data.step);
      setMetrics(data.metrics);
      setCurrentStep(data.metrics.current_step);
      setTotalSteps(data.metrics.total_steps);
    };

    const handleComplete = (data: { result: BFSResult }) => {
      setResult(data.result);
      setIsRunning(false);
      setIsPaused(false);
      setTotalSteps(data.result.history.length);
    };

    const handleError = (data: { error: string }) => {
      setError(data.error);
      setIsRunning(false);
      setIsPaused(false);
    };

    wsService.on('bfs_step_update', handleStepUpdate);
    wsService.on('bfs_complete', handleComplete);
    wsService.on('bfs_error', handleError);

    return () => {
      wsService.off('bfs_step_update', handleStepUpdate);
      wsService.off('bfs_complete', handleComplete);
      wsService.off('bfs_error', handleError);
    };
  }, []);

  const startBFS = useCallback((
    graphId: string,
    startNode: string,
    goalNode: string,
    orderType: OrderType,
    speed: number,
    algorithmType: AlgorithmType = 'bfs'
  ) => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
    setResult(null);
    setCurrentStepData(null);
    setMetrics(null);
    setError(null);
    setConfig({ start_node: startNode, goal_node: goalNode, order_type: orderType, speed, algorithm_type: algorithmType });
    wsService.startBFS(graphId, startNode, goalNode, orderType, speed, algorithmType);
  }, []);

  const pauseBFS = useCallback(() => {
    setIsPaused(true);
    wsService.pauseBFS();
  }, []);

  const resumeBFS = useCallback(() => {
    setIsPaused(false);
    wsService.resumeBFS();
  }, []);

  const stopBFS = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    wsService.stopBFS();
  }, []);

  const stepForward = useCallback(() => {
    wsService.stepBFS('forward');
  }, []);

  const stepBackward = useCallback(() => {
    wsService.stepBFS('backward');
  }, []);

  const seekToStep = useCallback((step: number) => {
    wsService.seekBFS(step);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (config) {
      setConfig({ ...config, speed });
    }
  }, [config]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setResult(null);
    setCurrentStepData(null);
    setMetrics(null);
    setConfig(null);
    setError(null);
  }, []);

  return (
    <BFSContext.Provider
      value={{
        isRunning,
        isPaused,
        currentStep,
        totalSteps,
        result,
        currentStepData,
        metrics,
        config,
        error,
        startBFS,
        pauseBFS,
        resumeBFS,
        stopBFS,
        stepForward,
        stepBackward,
        seekToStep,
        setSpeed,
        reset,
      }}
    >
      {children}
    </BFSContext.Provider>
  );
};

export const useBFS = () => {
  const context = useContext(BFSContext);
  if (!context) {
    throw new Error('useBFS must be used within BFSProvider');
  }
  return context;
};
