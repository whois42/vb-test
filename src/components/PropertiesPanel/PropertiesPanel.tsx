import TextField from "@mui/material/TextField";
import type { Node } from "../../utils/types";
import styles from "./PropertiesPanel.module.css";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onChangeNodeLabel: (key: string, newLabel: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onChangeNodeLabel,
}) => {
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      onChangeNodeLabel(selectedNode.id, e.target.value);
    }
  };

  return (
    <div>
      <div className={styles.properties_panel__container_header}>
        <span>Properties</span>
      </div>

      {selectedNode ? (
        <div className={styles.properties_panel__properties_container}>
          <TextField
            label="Name"
            size="small"
            value={selectedNode.name}
            onChange={handleLabelChange}
            autoComplete="off"
          />

          <TextField
            label="Type"
            size="small"
            value={selectedNode.type}
            disabled
          />
        </div>
      ) : (
        <div className={styles.properties_panel__properties_container__empty}>
          Select a node to display it's properties
        </div>
      )}
    </div>
  );
};
