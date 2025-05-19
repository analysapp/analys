// components/FluxogramaConta.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

const FluxogramaConta = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mostrandoEtapas, setMostrandoEtapas] = useState(false);

  const toggleEtapas = () => {
    if (!mostrandoEtapas) {
      const novosNodes: Node[] = [
        {
          id: '1',
          data: { label: 'Análise Gráfica' },
          position: { x: 520, y: 0 },
          style: {
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
          },
        },
        {
          id: '2',
          data: { label: 'Cidade: Itaúna' },
          position: { x: 520, y: 100 },
          style: {
            backgroundColor: '#f7f7f5',
            color: '#000',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: '1px solid #e5e7eb',
          },
        },
        {
          id: '3',
          data: { label: 'Fazer Upload do PDF' },
          position: { x: 520, y: 200 },
          style: {
            backgroundColor: '#f7f7f5',
            color: '#000',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: '1px solid #e5e7eb',
          },
        },
      ];

      const novasArestas: Edge[] = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ];

      setNodes(novosNodes);
      setEdges(novasArestas);
      setMostrandoEtapas(true);
    } else {
      setNodes([]);
      setEdges([]);
      setMostrandoEtapas(false);
    }
  };

  useEffect(() => {
    toggleEtapas();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll
      >
        <Background color="#f7f7f5" gap={16} />
        <MiniMap zoomable pannable />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default FluxogramaConta;
