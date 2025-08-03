export interface ToolbarButton {
  id: string;
  icon: string;
  iconName?: string;
  tooltip: string;
  action: () => void;
}
