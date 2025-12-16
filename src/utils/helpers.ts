import * as go from 'gojs';

export type GoNodeData = go.ObjectData & {
  key: string;
  text: string;
  type: 'Node';
};

export type GoLinkData = go.ObjectData & {
  key: string;
  from: string;
  to: string;
};

export type RandomFn = () => number;

export function nodeAt(
  nodes: GoNodeData[],
  columns: number,
  row: number,
  col: number,
): GoNodeData | null {
  if (!Number.isFinite(columns) || columns <= 0) return null;
  const idx = row * columns + col;
  return idx >= 0 && idx < nodes.length ? nodes[idx] : null;
}

export function hasDirectedLink(links: GoLinkData[], from: string, to: string): boolean {
  return links.some((el) => el.from === from && el.to === to);
}

export function addDirectedLink(
  links: GoLinkData[],
  from: string,
  to: string,
  nextLinkId: number,
): { links: GoLinkData[]; added: boolean; nextLinkId: number } {
  if (from === to) return { links, added: false, nextLinkId };
  if (hasDirectedLink(links, from, to)) return { links, added: false, nextLinkId };

  const link: GoLinkData = { key: `link-${nextLinkId}`, from, to };
  return {
    links: [...links, link],
    added: true,
    nextLinkId: nextLinkId + 1,
  };
}

export const generateConnectedGraph = (
  nodeCount = 100,
  extraLinksPerNode = 1,
  random: RandomFn = Math.random, // needed for testing to provide deterministic randomness
): { nodeDataArray: GoNodeData[]; linkDataArray: GoLinkData[] } => {
  const nodeDataArray: GoNodeData[] = Array.from({ length: nodeCount }, (_, i) => {
    const key = `node-${i + 1}`;
    const label = `Node ${i + 1}`;
    return { key, text: label, type: 'Node' };
  });

  let linkDataArray: GoLinkData[] = [];
  let nextLinkId = 1;

  for (let i = 0; i < nodeCount - 1; i++) {
    const from = nodeDataArray[i].key;
    const to = nodeDataArray[i + 1].key;

    const res = addDirectedLink(linkDataArray, from, to, nextLinkId);
    linkDataArray = res.links;
    nextLinkId = res.nextLinkId;
  }

  const maxExtraLinks = nodeCount * extraLinksPerNode;

  for (let i = 0; i < maxExtraLinks; i++) {
    if (nodeCount === 0) break;

    const a = Math.floor(random() * nodeCount);
    let b = Math.floor(random() * nodeCount);
    if (b === a) b = (b + 1) % nodeCount;

    const from = nodeDataArray[a].key;
    const to = nodeDataArray[b].key;

    const res = addDirectedLink(linkDataArray, from, to, nextLinkId);

    if (res.added) {
      linkDataArray = res.links;
      nextLinkId = res.nextLinkId;
    }
  }

  return { nodeDataArray, linkDataArray };
};
