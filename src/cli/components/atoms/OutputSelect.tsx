import SelectInput from 'ink-select-input';
import { useCallback, useMemo } from 'react';

import { FragmentType, graphql, unmask } from '../../../gql/index.js';
import type { OutputItemFragment } from '../../../gql/graphql.js';

// Fragment
export const OutputItem = graphql(/* GraphQL */ `
  fragment OutputItem on RedirectionOutput {
    id
    name
  }
`);

// Component
export interface OutputSelectProps {
  readonly items: readonly FragmentType<typeof OutputItem>[];
  readonly onSelect: (output: OutputItemFragment) => void;
}

export default function OutputSelect(props: OutputSelectProps) {
  const { items, onSelect } = props;

  const outputs = useMemo(() => unmask(OutputItem, items).map((output) => ({
    key: output.id,
    label: output.name,
    value: output,
  })), [items]);
  const handleChange = useCallback((item: OutputItem) => onSelect(item.value), [onSelect]);

  return <SelectInput items={outputs} onSelect={handleChange} />;
}

interface OutputItem {
  key?: string;
  label: string;
  value: OutputItemFragment;
}