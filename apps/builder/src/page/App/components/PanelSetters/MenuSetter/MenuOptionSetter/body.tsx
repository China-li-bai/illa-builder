import { FC, useContext } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { ColumnListSetterContext } from "./context/columnListContext"
import { EmptyBody } from "./empty"
import { removeNativeStyle } from "@/page/App/components/PanelSetters/TableSetter/ColumnSetter/style"
import { ColumnItem } from "@/page/App/components/PanelSetters/MenuSetter/MenuOptionSetter/columnItem"

export const ListBody: FC = () => {
  const { columnItems, handleUpdateDsl, attrPath } = useContext(
    ColumnListSetterContext,
  )

  if (!columnItems || !Array.isArray(columnItems) || columnItems.length === 0)
    return <EmptyBody />

  return (
    <Reorder.Group
      axis="y"
      initial={false}
      values={columnItems}
      onReorder={(value) => {
        handleUpdateDsl(attrPath, value)
      }}
      css={removeNativeStyle}
    >
      {columnItems.map((item, index) => {
        const { title, id, disabled, icon, subMenu } = item
        return (
          <Reorder.Item
            initial={false}
            css={removeNativeStyle}
            key={item.title}
            value={item}
          >
            <ColumnItem {...item} index={index} />
          </Reorder.Item>
        )
      })}
    </Reorder.Group>
  )
}
