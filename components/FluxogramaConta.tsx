import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function FluxogramaConta() {
  const estiloNo = {
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 999,
    padding: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: 160,
    textAlign: "center" as const,
    cursor: 'pointer',
  };

  const initialNodes: Node[] = [
    {
      id: '1',
      data: { label: 'Análise Gráfica' },
      position: { x: 400, y: 40 },
      type: 'default',
      style: {
        ...estiloNo,
        background: '#000',
        color: '#fff',
      },
      sourcePosition: Position.Bottom,
      draggable: false,
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mostrarCidade, setMostrarCidade] = useState(false);
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [mostrarRamificacoes, setMostrarRamificacoes] = useState(false);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      if (node.id === '1' && !mostrarCidade) {
        const cidadeNode: Node = {
          id: '2',
          data: { label: 'Cidade: Itaúna' },
          position: { x: 400, y: 160 },
          type: 'default',
          style: estiloNo,
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          draggable: true,
        };

        setNodes((nds) => [...nds, cidadeNode]);
        setEdges((eds) => [
          ...eds,
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'default',
            style: { stroke: 'black' },
          },
        ]);

        setMostrarCidade(true);
      }

      if (node.id === '2' && !mostrarUpload) {
        const uploadNode: Node = {
          id: '3',
          data: { label: 'Upload PDF' },
          position: { x: 400, y: 300 },
          type: 'default',
          style: estiloNo,
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          draggable: true,
        };

        setNodes((nds) => [...nds, uploadNode]);
        setEdges((eds) => [
          ...eds,
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'default',
            style: { stroke: 'black' },
          },
        ]);

        setMostrarUpload(true);
      }

      if (node.id === '3' && !mostrarRamificacoes) {
        const registroNode: Node = {
          id: '4',
          data: { label: 'Registro de Imóveis' },
          position: { x: 300, y: 440 },
          type: 'default',
          style: estiloNo,
          targetPosition: Position.Top,
          draggable: true,
        };

        const projetoNode: Node = {
          id: '5',
          data: { label: 'Projeto Simplificado' },
          position: { x: 520, y: 440 },
          type: 'default',
          style: estiloNo,
          targetPosition: Position.Top,
          draggable: true,
        };

        setNodes((nds) => [...nds, registroNode, projetoNode]);
        setEdges((eds) => [
          ...eds,
          {
            id: 'e3-4',
            source: '3',
            target: '4',
            type: 'default',
            style: { stroke: 'black' },
          },
          {
            id: 'e3-5',
            source: '3',
            target: '5',
            type: 'default',
            style: { stroke: 'black' },
          },
        ]);

        setMostrarRamificacoes(true);
      }
    },
    [mostrarCidade, mostrarUpload, mostrarRamificacoes, setNodes, setEdges]
  );

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
