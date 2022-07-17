import { HTMLAttributes, MouseEvent } from "react"
import { ActionItem } from "@/redux/currentApp/action/actionState"

export interface ActionListProps extends HTMLAttributes<HTMLDivElement> {
  loading?: boolean
  onAddActionItem: (data: Omit<ActionItem, "actionId">) => void
  onUpdateActionItem: (
    actionId: string,
    data: ActionItem & { oldDisplayName?: string },
  ) => void
  onDuplicateActionItem: (actionId: string) => void
  onDeleteActionItem: (actionId: string) => void
  onSelectActionItem: (actionId: string) => void
  isActionDirty?: boolean
}

export interface SearchHeaderProps {
  updateAction: (action: string) => void
}

export interface ContextMenuProps {
  id?: string
  contextMenuEvent?: MouseEvent
  onDuplicate?: () => void
  onDelete?: () => void
}