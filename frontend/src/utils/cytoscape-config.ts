import cytoscape from 'cytoscape';
import { Graph, BFSStep } from '@/types/graph.types';

// Глобальна змінна для збереження інтервалу анімації
let pulseInterval: NodeJS.Timeout | null = null;

// Глобальна змінна для SVG overlay елементів (сяючі точки)
let edgePulseElements: HTMLElement[] = [];

export const getCytoscapeConfig = (
  containerRef: HTMLElement,
  graph: Graph | null
): cytoscape.Core => {
  const elements: cytoscape.ElementDefinition[] = [];

  if (graph) {
    Object.values(graph.nodes).forEach(node => {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
        },
        position: {
          x: node.x,
          y: node.y,
        },
      });
    });

    Object.values(graph.edges).forEach(edge => {
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          directed: edge.directed,
          weight: edge.weight,
        },
      });
    });
  }

  const cy = cytoscape({
    container: containerRef,
    elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'border-width': 2,
          'border-color': 'data(borderColor)',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '12px',
          'font-weight': '500',
          'color': '#ffffff',
          'width': 40,
          'height': 40,
        },
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 3,
          'border-color': '#0ea5e9',
        },
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#cbd5e1',
          'target-arrow-color': '#cbd5e1',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#0ea5e9',
          'target-arrow-color': '#0ea5e9',
          'width': 3,
        },
      },
      {
        selector: '.node-default',
        style: {
          'background-color': '#94a3b8',
          'border-color': '#64748b',
        },
      },
      {
        selector: '.node-start',
        style: {
          'background-color': '#10b981',
          'border-color': '#059669',
        },
      },
      {
        selector: '.node-goal',
        style: {
          'background-color': '#ef4444',
          'border-color': '#dc2626',
        },
      },
      {
        selector: '.node-visited',
        style: {
          'background-color': '#3b82f6',
          'border-color': '#2563eb',
        },
      },
      {
        selector: '.node-queue',
        style: {
          'background-color': '#fbbf24',
          'border-color': '#f59e0b',
        },
      },
      {
        selector: '.node-current',
        style: {
          'background-color': '#8b5cf6',
          'border-color': '#7c3aed',
          'border-width': 4,
        },
      },
      {
        selector: '.node-path',
        style: {
          'border-width': 5,
          'border-color': '#10b981',
          'background-color': '#34d399',
          'transition-property': 'border-width, border-color, background-color',
          'transition-duration': '0.5s',
          'transition-timing-function': 'ease-in-out',
        },
      },
      {
        selector: '.pulse-path',
        style: {
          'border-width': 6,
          'border-color': '#10b981',
          'background-color': '#6ee7b7',
          'box-shadow': '0 0 20px #10b981',
        },
      },
      {
        selector: '.pulse-travel',
        style: {
          'border-width': 8,
          'border-color': '#6ee7b7',
          'background-color': '#a7f3d0',
          'box-shadow': '0 0 30px #10b981',
        },
      },
      {
        selector: '.selected-source',
        style: {
          'border-width': 4,
          'border-color': '#3b82f6',
          'background-color': '#60a5fa',
        },
      },
      {
        selector: '.edge-default',
        style: {
          'line-color': '#cbd5e1',
          'target-arrow-color': '#cbd5e1',
          'target-arrow-shape': (ele: any) => ele.data('directed') ? 'triangle' : 'none',
        },
      },
      {
        selector: '.edge-path',
        style: {
          'line-color': '#10b981',
          'target-arrow-color': '#10b981',
          'width': 5,
          'target-arrow-shape': (ele: any) => ele.data('directed') ? 'triangle' : 'none',
          'transition-property': 'line-color, width, target-arrow-color',
          'transition-duration': '0.5s',
          'transition-timing-function': 'ease-in-out',
        },
      },
    ],
    layout: {
      name: 'preset',
    },
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    minZoom: 0.3,
    maxZoom: 3,
    wheelSensitivity: 0.4, 
  });

  updateNodeColors(cy, null, null, null);
  updateEdgeColors(cy, null);

  return cy;
};

export const updateNodeColors = (
  cy: cytoscape.Core,
  startNode: string | null,
  goalNode: string | null,
  step: BFSStep | null
) => {
  cy.nodes().removeClass('node-default node-start node-goal node-visited node-queue node-current node-path');

  cy.nodes().forEach(node => {
    const nodeId = node.id();

    if (nodeId === startNode) {
      node.addClass('node-start');
    } else if (nodeId === goalNode) {
      node.addClass('node-goal');
    } else if (step) {
      if (nodeId === step.current_node && step.action === 'VISIT') {
        node.addClass('node-current');
      } else if (step.visited.includes(nodeId)) {
        node.addClass('node-visited');
      } else if (step.queue.includes(nodeId)) {
        node.addClass('node-queue');
      } else {
        node.addClass('node-default');
      }
    } else {
      node.addClass('node-default');
    }
  });
};

export const updateEdgeColors = (cy: cytoscape.Core, path: string[] | null) => {
  cy.edges().removeClass('edge-default edge-path');

  cy.edges().forEach(edge => {
    const edgeData = edge.data();
    const source = edgeData.source;
    const target = edgeData.target;
    const directed = edgeData.directed;

    if (path && path.length > 1) {
      let isInPath = false;
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === source && path[i + 1] === target) ||
            (!directed && path[i] === target && path[i + 1] === source)) {
          isInPath = true;
          break;
        }
      }

      if (isInPath) {
        edge.addClass('edge-path');
      } else {
        edge.addClass('edge-default');
      }
    } else {
      edge.addClass('edge-default');
    }
  });
};

export const highlightPath = (cy: cytoscape.Core, path: string[]) => {
  // Очищаємо попередній інтервал
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }

  // Очищаємо попередні SVG елементи сяючих точок
  edgePulseElements.forEach(el => el.remove());
  edgePulseElements = [];

  cy.nodes().removeClass('node-path pulse-path pulse-travel');
  cy.edges().removeClass('edge-path pulse-edge-travel');

  // Створюємо SVG overlay для анімації точок
  const container = cy.container();
  if (!container) return;

  let svgOverlay = container.querySelector('.pulse-overlay') as SVGElement;
  if (!svgOverlay) {
    svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.classList.add('pulse-overlay');
    svgOverlay.style.position = 'absolute';
    svgOverlay.style.top = '0';
    svgOverlay.style.left = '0';
    svgOverlay.style.width = '100%';
    svgOverlay.style.height = '100%';
    svgOverlay.style.pointerEvents = 'none';
    svgOverlay.style.zIndex = '999';
    container.appendChild(svgOverlay);
  }

  // Функція для створення сяючої точки вздовж ребра
  const createEdgePulse = (fromNode: cytoscape.NodeSingular, toNode: cytoscape.NodeSingular) => {
    const fromPos = fromNode.renderedPosition();
    const toPos = toNode.renderedPosition();

    // Створюємо групу для точки та свічення
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Зовнішнє свічення
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', '12');
    glow.setAttribute('fill', '#10b981');
    glow.setAttribute('opacity', '0.4');
    glow.setAttribute('filter', 'blur(4px)');

    // Внутрішня яскрава точка
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '6');
    dot.setAttribute('fill', '#6ee7b7');
    dot.setAttribute('opacity', '1');

    group.appendChild(glow);
    group.appendChild(dot);
    svgOverlay.appendChild(group);
    edgePulseElements.push(group);

    // Анімація руху вздовж ребра
    const duration = 600; // мілісекунди
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Лінійна інтерполяція позиції
      const x = fromPos.x + (toPos.x - fromPos.x) * progress;
      const y = fromPos.y + (toPos.y - fromPos.y) * progress;

      glow.setAttribute('cx', x.toString());
      glow.setAttribute('cy', y.toString());
      dot.setAttribute('cx', x.toString());
      dot.setAttribute('cy', y.toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Видаляємо точку після завершення анімації
        group.remove();
        const index = edgePulseElements.indexOf(group);
        if (index > -1) {
          edgePulseElements.splice(index, 1);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Функція для запуску імпульсу
  const runPulse = () => {
    path.forEach((nodeId, index) => {
      setTimeout(() => {
        const node = cy.$id(nodeId);
        node.addClass('node-path');

        // Додаємо клас пульсації для вершини
        node.addClass('pulse-travel');

        // Анімація точки по ребру до наступної вершини
        if (index < path.length - 1) {
          const currentNode = cy.$id(path[index]);
          const nextNode = cy.$id(path[index + 1]);

          // Створюємо сяючу точку через 150ms після вершини
          setTimeout(() => {
            createEdgePulse(currentNode, nextNode);
          }, 150);
        }

        // Видаляємо клас після анімації вершини
        setTimeout(() => {
          node.removeClass('pulse-travel');
        }, 1200);
      }, index * 300);
    });
  };

  // Перший прохід
  runPulse();

  // Повторюємо безкінечно
  const totalDuration = path.length * 300 + 1200; // Час на весь шлях + анімація
  pulseInterval = setInterval(runPulse, totalDuration);

  // Підсвічуємо ребра шляху
  updateEdgeColors(cy, path);

  // Постійна пульсація для початкової та кінцевої вершини
  if (path.length > 0) {
    const startNode = cy.$id(path[0]);
    const endNode = cy.$id(path[path.length - 1]);

    setTimeout(() => {
      startNode.addClass('pulse-path');
      endNode.addClass('pulse-path');
    }, 100);
  }
};

export const resetVisualization = (cy: cytoscape.Core) => {
  // Очищаємо інтервал анімації
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }

  // Очищаємо SVG елементи сяючих точок
  edgePulseElements.forEach(el => el.remove());
  edgePulseElements = [];

  // Видаляємо SVG overlay
  const container = cy.container();
  if (container) {
    const svgOverlay = container.querySelector('.pulse-overlay');
    if (svgOverlay) {
      svgOverlay.remove();
    }
  }

  cy.nodes().removeClass('node-start node-goal node-visited node-queue node-current node-path pulse-path pulse-travel');
  cy.edges().removeClass('edge-path pulse-edge-travel');
  cy.nodes().addClass('node-default');
  cy.edges().addClass('edge-default');
};
