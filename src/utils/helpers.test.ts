import { generateConnectedGraph, addDirectedLink, hasDirectedLink, nodeAt } from './helpers';

const makeFakeRandom = (values: number[]): (() => number) => {
  let i = 0;
  return () => {
    const res = values[i % values.length];
    i += 1;
    return res;
  };
};

describe('generateConnectedGraph – nodes + links', () => {
  test('generates a connected chain of nodes', () => {
    const { nodeDataArray, linkDataArray } = generateConnectedGraph(5, 0);

    // Nodes
    expect(nodeDataArray.map((n) => n.key)).toEqual([
      'node-1',
      'node-2',
      'node-3',
      'node-4',
      'node-5',
    ]);

    // Links: chain only
    expect(linkDataArray).toHaveLength(4);

    expect(linkDataArray[0]).toEqual({
      key: 'link-1',
      from: 'node-1',
      to: 'node-2',
    });

    expect(linkDataArray[3]).toEqual({
      key: 'link-4',
      from: 'node-4',
      to: 'node-5',
    });
  });

  test('extra links are added and all link ids are sequential', () => {
    const random = makeFakeRandom([0.1, 0.5, 0.7]);
    const nodeCount = 10;
    const extraLinksPerNode = 1;

    const { nodeDataArray, linkDataArray } = generateConnectedGraph(
      nodeCount,
      extraLinksPerNode,
      random,
    );

    const expectedMinLinks = nodeCount - 1;
    const expectedMaxLinks = expectedMinLinks + nodeCount * extraLinksPerNode;

    expect(linkDataArray.length).toBeGreaterThanOrEqual(expectedMinLinks);
    expect(linkDataArray.length).toBeLessThanOrEqual(expectedMaxLinks);
    linkDataArray.forEach((link, index) => {
      expect(link.key).toBe(`link-${index + 1}`);
    });
    const nodeKeys = new Set(nodeDataArray.map((n) => n.key));

    for (const link of linkDataArray) {
      expect(nodeKeys.has(link.from)).toBe(true);
      expect(nodeKeys.has(link.to)).toBe(true);
    }
  });

  test('no self-links are generated', () => {
    const random = makeFakeRandom([0.1, 0.5, 0.7]);
    const { linkDataArray } = generateConnectedGraph(50, 2, random);

    for (const link of linkDataArray) {
      expect(link.from).not.toBe(link.to);
    }
  });

  test('graph remains connected', () => {
    const { nodeDataArray, linkDataArray } = generateConnectedGraph(20, 1);

    const incoming = new Map<string, number>();

    for (const node of nodeDataArray) {
      incoming.set(node.key, 0);
    }

    for (const link of linkDataArray) {
      incoming.set(link.to, (incoming.get(link.to) ?? 0) + 1);
    }
    for (let i = 1; i < nodeDataArray.length; i++) {
      expect(incoming.get(`node-${i + 1}`)).toBeGreaterThan(0);
    }
  });
});

describe('link helpers', () => {
  test('addDirectedLink adds a valid link', () => {
    const res = addDirectedLink([], 'node-1', 'node-2', 1);

    expect(res.added).toBe(true);
    expect(res.links).toEqual([{ key: 'link-1', from: 'node-1', to: 'node-2' }]);
    expect(res.nextLinkId).toBe(2);
  });

  test('addDirectedLink blocks self-links', () => {
    const res = addDirectedLink([], 'node-1', 'node-1', 1);

    expect(res.added).toBe(false);
    expect(res.links).toHaveLength(0);
  });

  test('addDirectedLink blocks duplicate directed links', () => {
    const links = [{ key: 'link-1', from: 'node-1', to: 'node-2' }];
    const res = addDirectedLink(links, 'node-1', 'node-2', 2);

    expect(res.added).toBe(false);
    expect(res.links).toBe(links);
  });

  test('allows reverse-direction links', () => {
    const links = [{ key: 'link-1', from: 'node-1', to: 'node-2' }];
    const res = addDirectedLink(links, 'node-2', 'node-1', 2);

    expect(res.added).toBe(true);
    expect(res.links).toHaveLength(2);
  });

  test('hasDirectedLink detects existing links', () => {
    const links = [{ key: 'link-1', from: 'a', to: 'b' }];

    expect(hasDirectedLink(links, 'a', 'b')).toBe(true);
    expect(hasDirectedLink(links, 'b', 'a')).toBe(false);
  });
});

describe('nodeAt helper', () => {
  const nodes = [
    { key: 'node-1', text: 'Node 1', type: 'Node' as const },
    { key: 'node-2', text: 'Node 2', type: 'Node' as const },
    { key: 'node-3', text: 'Node 3', type: 'Node' as const },
    { key: 'node-4', text: 'Node 4', type: 'Node' as const },
  ];

  test('returns correct node for valid row/col', () => {
    expect(nodeAt(nodes, 2, 0, 0)?.key).toBe('node-1');
    expect(nodeAt(nodes, 2, 0, 1)?.key).toBe('node-2');
    expect(nodeAt(nodes, 2, 1, 0)?.key).toBe('node-3');
    expect(nodeAt(nodes, 2, 1, 1)?.key).toBe('node-4');
  });

  test('returns null for out-of-bounds', () => {
    expect(nodeAt(nodes, 2, 2, 0)).toBeNull();
    expect(nodeAt(nodes, 2, -1, 0)).toBeNull();
    expect(nodeAt(nodes, 0, 0, 0)).toBeNull();
  });
});
