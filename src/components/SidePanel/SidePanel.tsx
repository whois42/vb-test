import { useMemo } from 'react';
import { Divider } from '@mui/material';
import { PropertiesPanel } from '../PropertiesPanel/PropertiesPanel';
import { SidePanelNodeList } from '../SidePanelNodeList/SidePanelNodeList';
import type { Node } from '../../utils/types';
import styles from './SidePanel.module.css';

interface SidePanelProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onSelectNode: (key: string) => void;
  onChangeNodeLabel: (key: string, newLabel: string) => void;
  onAddNode: () => void;
  onBulkGenerate: () => void;
  onClear: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onChangeNodeLabel,
  onAddNode,
  onBulkGenerate,
  onClear,
}) => {
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  return (
    <div className={styles.side_panel__container}>
      <div className={styles.side_panel__container_header}>
        <span>Network visualiser</span>
      </div>
      <Divider />
      <SidePanelNodeList
        nodes={nodes}
        selectedKey={selectedNodeId}
        onSelectNode={onSelectNode}
        onAddNode={onAddNode}
        onBulkGenerate={onBulkGenerate}
        onClear={onClear}
      />
      <Divider />
      <PropertiesPanel selectedNode={selectedNode} onChangeNodeLabel={onChangeNodeLabel} />
    </div>
  );
};
