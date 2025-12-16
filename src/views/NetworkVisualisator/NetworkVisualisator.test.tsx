import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as helpers from '../../utils/helpers';
import { NetworkVisualisator } from './NetworkVisualisator';

jest.mock('../../components/DiagramWrapper/DiagramWrapper', () => {
  return {
    DiagramWrapper: (props: {
      onModelChange: (data: unknown) => void;
      onDiagramEvent: (event: unknown) => void;
      nodeDataArray: Array<go.ObjectData>;
      linkDataArray: Array<go.ObjectData>;
    }) => {
      return (
        <div data-testid="diagram-mock">
          <button
            data-testid="simulate-model-change"
            onClick={() =>
              props.onModelChange({
                modifiedLinkData: [{ key: 'link-1', from: 'node-1', to: 'node-2' }],
              })
            }
          >
            model
          </button>

          <button
            data-testid="simulate-selection"
            onClick={() =>
              props.onDiagramEvent({
                name: 'ChangedSelection',
                subject: { first: () => ({ data: { key: 'node-1' } }) },
              })
            }
          >
            select
          </button>

          <div data-testid="nodes">{JSON.stringify(props.nodeDataArray)}</div>
          <div data-testid="links">{JSON.stringify(props.linkDataArray)}</div>
        </div>
      );
    },
  };
});

describe('NetworkVisualisator (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds a node when clicking the add button', async () => {
    const user = userEvent.setup();
    render(<NetworkVisualisator />);
    const addBtn = screen.getByLabelText('add');
    await user.click(addBtn);
    expect(screen.getByText('New node')).toBeInTheDocument();
  });

  test('bulk generate uses generateConnectedGraph and shows generated nodes', async () => {
    const user = userEvent.setup();

    const fake = {
      nodeDataArray: [
        { key: 'node-1', text: 'Generated 1', type: 'Node' as const },
        { key: 'node-2', text: 'Generated 2', type: 'Node' as const },
      ],
      linkDataArray: [],
    };

    const spy = jest.spyOn(helpers, 'generateConnectedGraph').mockReturnValue(fake);

    render(<NetworkVisualisator />);

    const genBtn = screen.getByRole('button', { name: /generate 1000/i });
    await user.click(genBtn);

    expect(spy).toHaveBeenCalledWith(1000, 1);
    expect(screen.getByText('Generated 1')).toBeInTheDocument();
    expect(screen.getByText('Generated 2')).toBeInTheDocument();
  });

  test('updating node name via PropertiesPanel updates the node list', async () => {
    const user = userEvent.setup();
    render(<NetworkVisualisator />);

    await user.click(screen.getByLabelText('add'));
    await user.click(screen.getByText('New node'));

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed node');

    expect(screen.getByText('Renamed node')).toBeInTheDocument();
  });

  test('model change from diagram adds links to state', async () => {
    const user = userEvent.setup();
    render(<NetworkVisualisator />);

    await user.click(screen.getByLabelText('add'));
    await user.click(screen.getByTestId('simulate-model-change'));

    const linksDiv = screen.getByTestId('links');
    expect(linksDiv.textContent).toContain('"key":"link-1"');
    expect(linksDiv.textContent).toContain('"from":"node-1"');
    expect(linksDiv.textContent).toContain('"to":"node-2"');
  });

  test('selection from diagram updates selected node in the properties panel', async () => {
    const user = userEvent.setup();
    render(<NetworkVisualisator />);

    await user.click(screen.getByLabelText('add'));
    await user.click(screen.getByTestId('simulate-selection'));

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput).toHaveValue('New node');
  });
});
