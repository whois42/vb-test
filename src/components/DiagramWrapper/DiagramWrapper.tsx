import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useEffect, useRef } from 'react';
import styles from './DiagramWrapper.module.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  selectedNodeId: string | null;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

const nextNodeKey = (model: go.Model): string => {
  const nodeCount = model.nodeDataArray.length;
  let key = `node-${nodeCount + 1}`;
  while (model.findNodeDataForKey(key)) {
    key = `node-${nodeCount + 1}`;
  }
  return `node-${nodeCount}`;
};

const nextLinkKey = (model: go.GraphLinksModel): string => {
  const linkCount = model.linkDataArray.length;
  let key = `link-${linkCount + 1}`;
  while (model.findLinkDataForKey(key)) {
    key = `link-${linkCount + 1}`;
  }
  return `link-${linkCount}`;
};

export const DiagramWrapper = ({
  nodeDataArray,
  linkDataArray,
  modelData,
  skipsDiagramUpdate,
  selectedNodeId,
  onDiagramEvent,
  onModelChange,
}: DiagramProps) => {
  const diagramRef = useRef<ReactDiagram>(null);
  const selectionListenerRef = useRef<(e: go.DiagramEvent) => void>(() => {});

  // GoJS -> React selection changes
  useEffect(() => {
    if (!diagramRef.current) return;

    const diagram = diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram)) return;

    selectionListenerRef.current = (e: go.DiagramEvent) => onDiagramEvent(e);
    diagram.addDiagramListener('ChangedSelection', selectionListenerRef.current);

    return () => {
      diagram.removeDiagramListener('ChangedSelection', selectionListenerRef.current);
    };
  }, []);

  // React -> GoJS selection sync
  useEffect(() => {
    if (!diagramRef.current) return;

    const diagram = diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram)) return;

    const cur = diagram.selection.first();
    const curKey = cur?.data?.key ? String(cur.data.key) : null;

    if (curKey === selectedNodeId) return;

    diagram.startTransaction('select from react');

    if (!selectedNodeId) {
      diagram.clearSelection();
    } else {
      const part = diagram.findPartForKey(selectedNodeId);
      if (part) diagram.select(part);
      else diagram.clearSelection();
    }

    diagram.commitTransaction('select from react');
  }, [selectedNodeId]);

  const initDiagram = (): go.Diagram => {
    const diagram = new go.Diagram({
      'undoManager.isEnabled': true,
      'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
      'clickCreatingTool.archetypeNodeData': {
        type: 'Node',
        text: 'New node',
        loc: '0 0',
      },

      model: new go.GraphLinksModel({
        nodeKeyProperty: 'key',
        linkKeyProperty: 'key',
        linkFromKeyProperty: 'from',
        linkToKeyProperty: 'to',
        //Avoiding any duplications
        makeUniqueKeyFunction: (
          m: go.Model,
          data: { key: string; type: 'Node'; text: string; loc: string },
        ) => {
          console.log('MakeUniqKey', data);
          const k = nextNodeKey(m);
          data.key = k;
          return k;
        },
        makeUniqueLinkKeyFunction: (
          m: go.GraphLinksModel,
          data: { key: string; from: string; to: string },
        ) => {
          console.log('makeUniqueLinkKeyFunction', data);
          const k = nextLinkKey(m);
          data.key = k;
          return k;
        },
      }),
    });

    diagram.nodeTemplate = new go.Node('Auto')
      .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
      .add(
        new go.Shape('RoundedRectangle', {
          name: 'SHAPE',
          fill: 'white',
          strokeWidth: 0,
          portId: '',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
        }).bind('fill', 'color'),

        new go.TextBlock({
          margin: 8,
          editable: true,
          font: '400 .875rem Roboto, sans-serif',
        }).bindTwoWay('text'),
      );

    diagram.linkTemplate = new go.Link()
      .bindModel('relinkableFrom', 'canRelink')
      .bindModel('relinkableTo', 'canRelink')
      .add(new go.Shape(), new go.Shape({ toArrow: 'Standard' }));

    return diagram;
  };

  return (
    <div className={styles.diagram_wrapper__container}>
      <ReactDiagram
        ref={diagramRef}
        divClassName={styles.diagram_wrapper__container}
        initDiagram={initDiagram}
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        modelData={modelData}
        onModelChange={onModelChange}
        skipsDiagramUpdate={skipsDiagramUpdate}
      />
    </div>
  );
};
