import { useCallback, useMemo } from 'react';
import { ListItemButton, List, ListItemText, IconButton, Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Clear } from '@mui/icons-material';
import type { Node } from '../../utils/types';
import styles from './SidePanelNodeList.module.css';

interface NodeListProps {
  nodes: Node[];
  selectedKey: string | null;
  onSelectNode: (key: string) => void;
  onAddNode: () => void;
  onBulkGenerate: () => void;
  onClear: () => void;
}

export const SidePanelNodeList: React.FC<NodeListProps> = ({
  nodes,
  selectedKey,
  onSelectNode,
  onAddNode,
  onBulkGenerate,
  onClear,
}) => {
  const handleSelect = useCallback(
    (id: string) => {
      onSelectNode(id);
    },
    [onSelectNode],
  );

  const renderedList = useMemo(() => {
    return nodes.map((node) => (
      <ListItemButton
        key={node.id}
        dense
        selected={node.id === selectedKey}
        onClick={() => handleSelect(node.id)}
      >
        <ListItemText primary={node.name} secondary={node.type} />
      </ListItemButton>
    ));
  }, [nodes, selectedKey, handleSelect]);

  return (
    <div>
      <div className={styles.nodes_list__container_header}>
        <span>Nodes</span>
        <div className={styles.nodes_list__controls}>
          <Tooltip title="Generate 1000 nodes" placement="top">
            <Button
              size="small"
              onClick={onBulkGenerate}
              className={`${styles.nodes_list__extra_ctrl} ${styles.customButton}`}
              sx={{ padding: 0, lineHeight: '1rem', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Generate 1000
            </Button>
          </Tooltip>

          <Tooltip title="Clear all" placement="top">
            <IconButton onClick={onClear} aria-label="clear" className={styles.nodes_list__ctrl}>
              <Clear fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add node" placement="top">
            <IconButton onClick={onAddNode} className={styles.nodes_list__ctrl} aria-label="add">
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className={styles.nodes_list__list_container}>
        <List dense disablePadding>
          {renderedList}
        </List>
      </div>
    </div>
  );
};
