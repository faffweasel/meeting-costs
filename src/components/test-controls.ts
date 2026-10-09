import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

interface ControlProps {
  readonly children?: ReactNode;
  readonly 'aria-label'?: string;
  readonly 'aria-pressed'?: boolean;
  readonly value?: number | '';
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onClick?: () => void;
}

function findControl<Props = ControlProps>(
  node: ReactNode,
  type: unknown,
  label?: string
): ReactElement<Props> {
  const pending = Children.toArray(node);
  while (pending.length > 0) {
    const child = pending.shift();
    if (!isValidElement<ControlProps>(child)) continue;
    if (
      child.type === type &&
      (label === undefined || child.props['aria-label'] === label || child.props.children === label)
    ) {
      return child as ReactElement<Props>;
    }
    pending.push(...Children.toArray(child.props.children));
  }
  throw new Error(`Missing ${label ?? String(type)} control`);
}

export { findControl };
