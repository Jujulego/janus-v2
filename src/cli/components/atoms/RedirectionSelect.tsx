import SelectInput from 'ink-select-input';
import { useCallback, useMemo } from 'react';

import type { RedirectionItemFragment } from '../../../gql/graphql.js';
import { FragmentType, graphql, unmask } from '../../../gql/index.js';

// Fragment
export const RedirectionItem = graphql(/* GraphQL */ `
  fragment RedirectionItem on Redirection {
    id
    url
  }
`);

// Component
export interface RedirectionSelectProps {
  readonly items: readonly FragmentType<typeof RedirectionItem>[];
  readonly onSelect: (output: RedirectionItemFragment) => void;
}

export default function RedirectionSelect(props: RedirectionSelectProps) {
  const { items, onSelect } = props;

  const redirections = useMemo(() => unmask(RedirectionItem, items).map((redirection) => ({
    key: redirection.id,
    label: redirection.url,
    value: redirection,
  })), [items]);

  const handleChange = useCallback((item: RedirectionItem) => onSelect(item.value), [onSelect]);

  return <SelectInput items={redirections} onSelect={handleChange} />;
}

interface RedirectionItem {
  key?: string;
  label: string;
  value: RedirectionItemFragment;
}