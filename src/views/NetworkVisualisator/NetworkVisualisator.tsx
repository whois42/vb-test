import * as go from 'gojs';
import React, { useState } from 'react';
import { DiagramWrapper } from '../../components/DiagramWrapper/DiagramWrapper';
import { SidePanel } from '../../components/SidePanel/SidePanel';
import styles from './NetworkVisualisator.module.css';
import { generateConnectedGraph } from '../../utils/helpers';

interface NetworkVisualisatorState {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedKey: string | null;
  skipsDiagramUpdate: boolean;
}

const initialState: NetworkVisualisatorState = {
  nodeDataArray: [],
  linkDataArray: [],
  modelData: { canRelink: true },
  selectedKey: null,
  skipsDiagramUpdate: false,
};

export const NetworkVisualisator: React.FC = () => {
  const [nodeDataArray, setNodeDataArray] = useState<go.ObjectData[]>(initialState.nodeDataArray);
  const [linkDataArray, setLinkDataArray] = useState<go.ObjectData[]>(initialState.linkDataArray);
  const [modelData, setModelData] = useState<go.ObjectData>(initialState.modelData);
  const [selectedKey, setSelectedKey] = useState<string | null>(initialState.selectedKey);
  const [skipsDiagramUpdate, setSkipsDiagramUpdate] = useState<boolean>(
    initialState.skipsDiagramUpdate,
  );

  const handleDiagramEvent = (e: go.DiagramEvent) => {
    if (e.name === 'ChangedSelection') {
      const sel = e.subject.first();
      if (sel && sel.data) {
        setSelectedKey(sel.data.key);
      } else {
        setSelectedKey(null);
      }
      setSkipsDiagramUpdate(true);
    }
  };

  const handleModelChange = (changes: go.IncrementalData) => {
    const {
      modifiedNodeData,
      removedNodeKeys,
      modifiedLinkData,
      removedLinkKeys,
      modelData: modelChanges,
    } = changes;

    // Nodes
    if (modifiedNodeData && modifiedNodeData.length > 0) {
      setNodeDataArray((prev) => {
        const next = [...prev];

        modifiedNodeData.forEach((data) => {
          const idx = next.findIndex((node) => node.key === data.key);
          if (idx >= 0) {
            next[idx] = data;
          } else {
            next.push(data);
          }
        });

        return next;
      });
    }

    if (removedNodeKeys && removedNodeKeys.length > 0) {
      setNodeDataArray((prev) => prev.filter((n) => !removedNodeKeys.includes(n.key)));
    }

    // Links

    if (modifiedLinkData && modifiedLinkData.length > 0) {
      setLinkDataArray((prev) => {
        const next = [...prev];

        modifiedLinkData.forEach((ld) => {
          const idx = next.findIndex((l) => l.key === ld.key);
          if (idx >= 0) {
            next[idx] = ld;
          } else {
            next.push(ld);
          }
        });

        return next;
      });
    }

    if (removedLinkKeys && removedLinkKeys.length > 0) {
      setLinkDataArray((prev) => prev.filter((l) => !removedLinkKeys.includes(l.key)));
    }

    if (modelChanges) {
      setModelData((prev) => ({ ...prev, ...modelChanges }));
    }

    setSkipsDiagramUpdate(true);
  };

  const handleSelectNodeFromList = (id: string) => {
    setSelectedKey(id);
    setSkipsDiagramUpdate(false);
  };

  const handleChangeNodeName = (id: string, newName: string) => {
    setNodeDataArray((prev) =>
      prev.map((node) =>
        node.key === id
          ? {
              ...node,
              text: newName,
            }
          : node,
      ),
    );
    setSkipsDiagramUpdate(false);
  };

  const handleAddNode = () => {
    setNodeDataArray((prev) => {
      return [
        ...prev,
        {
          key: `node-${prev.length + 1}`,
          text: `New node`,
          loc: '0 0',
        },
      ];
    });
    setSkipsDiagramUpdate(false);
  };

  const handleGenerateThousandNodes = () => {
    const { nodeDataArray, linkDataArray } = generateConnectedGraph(1000, 1);
    setNodeDataArray(nodeDataArray);
    setLinkDataArray(linkDataArray);
    setSkipsDiagramUpdate(false);
  };

  const handleClearDiagram = () => {
    setNodeDataArray([]);
    setLinkDataArray([]);
    setSelectedKey(null);
    setSkipsDiagramUpdate(false);
  };

  return (
    <div className={styles.container}>
      <SidePanel
        nodes={nodeDataArray.map((node) => ({
          id: node.key,
          name: node.text,
          type: 'Node',
        }))}
        selectedNodeId={selectedKey}
        onSelectNode={handleSelectNodeFromList}
        onChangeNodeLabel={handleChangeNodeName}
        onAddNode={handleAddNode}
        onBulkGenerate={handleGenerateThousandNodes}
        onClear={handleClearDiagram}
      />
      <DiagramWrapper
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        modelData={modelData}
        skipsDiagramUpdate={skipsDiagramUpdate}
        onDiagramEvent={handleDiagramEvent}
        onModelChange={handleModelChange}
        selectedNodeId={selectedKey}
      />
    </div>
  );
};
