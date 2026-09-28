import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { useGraph } from '@/contexts/GraphContext';
import { useBFS } from '@/contexts/BFSContext';
import {
  getCytoscapeConfig,
  updateNodeColors,
  updateEdgeColors,
  highlightPath,
  resetVisualization,
} from '@/utils/cytoscape-config';
import { Node, Edge } from '@/types/graph.types';
import { Modal } from '@/components/Modal/Modal';
import { useModal } from '@/hooks/useModal';

interface GraphCanvasProps {
  startNode: string | null;
  goalNode: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ startNode, goalNode, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onNodeSelectRef = useRef(onNodeSelect);
  const viewportRef = useRef<{ zoom: number; pan: { x: number; y: number } } | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const { activeGraph, addNode, removeNode, addEdge, removeEdge, updateEdge } = useGraph();
  const { currentStepData, result } = useBFS();
  const { modalState, showConfirm, closeModal } = useModal();

  onNodeSelectRef.current = onNodeSelect;

  // Основний useEffect - створення та оновлення Cytoscape
  useEffect(() => {
    if (!containerRef.current || !activeGraph) return;

    // Зберігаємо viewport перед перестворенням
    if (cyRef.current) {
      viewportRef.current = {
        zoom: cyRef.current.zoom(),
        pan: cyRef.current.pan(),
      };
      cyRef.current.destroy();
    }

    const cy = getCytoscapeConfig(containerRef.current, activeGraph);
    cyRef.current = cy;

    // Відновлюємо viewport
    if (viewportRef.current) {
      cy.zoom(viewportRef.current.zoom);
      cy.pan(viewportRef.current.pan);
      setZoom(viewportRef.current.zoom);
    } else {
      setZoom(cy.zoom());
    }

    cy.on('zoom', () => {
      setZoom(cy.zoom());
    });

    // Обробник кліку на вершину
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeId = node.id();

      // Ctrl+клік - режим створення ребра
      if (evt.originalEvent.ctrlKey || evt.originalEvent.metaKey) {
        if (selectedSource) {
          // Другий клік - створюємо ребро
          if (selectedSource !== nodeId) {
            const edgeId = `e_${selectedSource}_${nodeId}_${Date.now()}`;
            const newEdge: Edge = {
              id: edgeId,
              source: selectedSource,
              target: nodeId,
              directed: activeGraph.graph_type === 'directed',
              weight: 1.0,
            };

            addEdge(newEdge).catch(console.error);
          }
          setSelectedSource(null);
          setMousePosition(null);
        } else {
          // Перший клік - вибираємо початкову вершину для ребра
          setSelectedSource(nodeId);
        }
      } else {
        // Звичайний клік - вибір вершини для BFS (start/goal)
        onNodeSelectRef.current(nodeId);
      }
    });

    // Обробник руху миші
    cy.on('mousemove', (evt) => {
      if (selectedSource) {
        setMousePosition({ x: evt.renderedPosition.x, y: evt.renderedPosition.y });
      }
    });

    // Обробник кліку на порожнє місце
    cy.on('tap', (evt) => {
      if (evt.target === cy && selectedSource) {
        setSelectedSource(null);
        setMousePosition(null);
      }
    });

    // ПКМ на canvas - створити вершину
    cy.on('cxttap', (evt) => {
      if (evt.target === cy) {
        const pos = evt.position;

        const existingNodes = Object.keys(activeGraph.nodes);
        const existingNumbers = existingNodes
          .filter(id => id.startsWith('n'))
          .map(id => parseInt(id.substring(1)))
          .filter(num => !isNaN(num));

        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : -1;
        const newNumber = maxNumber + 1;
        const nodeId = `n${newNumber}`;

        const newNode: Node = {
          id: nodeId,
          label: nodeId,
          x: pos.x,
          y: pos.y,
        };

        addNode(newNode).catch(console.error);
      }
    });

    // ПКМ на вершині - видалити
    cy.on('cxttap', 'node', (evt) => {
      evt.stopPropagation();
      const node = evt.target;
      const nodeId = node.id();

      showConfirm(
        'Видалення вершини',
        `Ви впевнені, що хочете видалити вершину ${nodeId}?`,
        () => {
          removeNode(nodeId).catch(console.error);
        }
      );
    });

    // ПКМ на ребрі - видалити
    cy.on('cxttap', 'edge', (evt) => {
      evt.stopPropagation();
      const edge = evt.target;
      const edgeId = edge.id();

      showConfirm(
        'Видалення ребра',
        `Ви впевнені, що хочете видалити ребро ${edgeId}?`,
        () => {
          removeEdge(edgeId).catch(console.error);
        }
      );
    });

    // Подвійний клік на ребрі - змінити directed/напрямок
    cy.on('dbltap', 'edge', (evt) => {
      const edge = evt.target;
      const edgeId = edge.id();
      const edgeData = activeGraph.edges[edgeId];

      if (edgeData) {
        let updatedEdge: Edge;

        // Shift+подвійний клік на дузі - змінити напрямок (source ↔ target)
        if (evt.originalEvent.shiftKey && edgeData.directed) {
          updatedEdge = {
            ...edgeData,
            source: edgeData.target,
            target: edgeData.source,
          };

          removeEdge(edgeId).then(() => {
            addEdge(updatedEdge).catch(console.error);
          }).catch(console.error);
        } else {
          // Просто подвійний клік - змінити directed
          // Дозволяємо тільки для змішаного типу графа
          if (activeGraph.graph_type === 'mixed') {
            updatedEdge = {
              ...edgeData,
              directed: !edgeData.directed,
            };

            removeEdge(edgeId).then(() => {
              addEdge(updatedEdge).catch(console.error);
            }).catch(console.error);
          }
          // Для 'undirected' та 'directed' не дозволяємо перемикання
        }
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [activeGraph, selectedSource, addNode, removeNode, addEdge, removeEdge, showConfirm]);

  useEffect(() => {
    if (!cyRef.current) return;

    if (result && result.path.length > 0) {
      highlightPath(cyRef.current, result.path);
      updateNodeColors(cyRef.current, startNode, goalNode, null);
    } else if (currentStepData) {
      updateNodeColors(cyRef.current, startNode, goalNode, currentStepData);
      updateEdgeColors(cyRef.current, null);
    } else {
      resetVisualization(cyRef.current);
      updateNodeColors(cyRef.current, startNode, goalNode, null);
      updateEdgeColors(cyRef.current, null);
    }
  }, [currentStepData, result, startNode, goalNode]);

  const handleZoomChange = (value: number) => {
    if (cyRef.current) {
      cyRef.current.zoom(value);
      cyRef.current.center();
      setZoom(value);
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      const newZoom = Math.min(cyRef.current.zoom() * 1.2, 3);
      cyRef.current.zoom(newZoom);
      cyRef.current.center();
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      const newZoom = Math.max(cyRef.current.zoom() / 1.2, 0.3);
      cyRef.current.zoom(newZoom);
      cyRef.current.center();
      setZoom(newZoom);
    }
  };

  const handleResetZoom = () => {
    if (cyRef.current) {
      cyRef.current.zoom(1);
      cyRef.current.center();
      setZoom(1);
    }
  };

  return (
    <>
      <div className="relative w-full h-full">
        <div
          ref={containerRef}
          tabIndex={0}
          className="w-full h-full rounded-lg border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary-500 graph-canvas-dots"
          style={{ minHeight: '600px' }}
        />

        {/* Лінія створення ребра */}
        {selectedSource && mousePosition && cyRef.current && (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1000 }}
          >
            <line
              x1={cyRef.current.$id(selectedSource).renderedPosition().x}
              y1={cyRef.current.$id(selectedSource).renderedPosition().y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Зменшити (Zoom Out)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>

            <div className="flex flex-col items-center gap-1 px-2">
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 0.3) / (3 - 0.3)) * 100}%, #e5e7eb ${((zoom - 0.3) / (3 - 0.3)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {(zoom * 100).toFixed(0)}%
              </span>
            </div>

            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Збільшити (Zoom In)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="w-full px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            100%
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </>
  );
};
