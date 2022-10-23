import { FC, forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { Input } from "@illa-design/input"
import { InputWidgetProps, WrappedInputProps } from "./interface"
import { Label } from "@/widgetLibrary/PublicSector/Label"
import {
  applyLabelAndComponentWrapperStyle,
  applyValidateMessageWrapperStyle,
} from "@/widgetLibrary/PublicSector/TransformWidgetWrapper/style"
import { InvalidMessage } from "@/widgetLibrary/PublicSector/InvalidMessage"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { useDispatch } from "react-redux"
import { handleValidateCheck } from "@/widgetLibrary/PublicSector/InvalidMessage/utils"

export const WrappedInput = forwardRef<HTMLInputElement, WrappedInputProps>(
  (props, ref) => {
    const {
      value,
      placeholder,
      disabled,
      readOnly,
      prefixIcon,
      prefixText,
      suffixIcon,
      suffixText,
      showCharacterCount,
      colorScheme,
      handleUpdateDsl,
      handleOnChange,
      allowClear,
      maxLength,
      minLength,
      handleValidate,
    } = props

    const [_value, setValue] = useState(value)

    return (
      <Input
        w="100%"
        inputRef={ref}
        value={_value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        prefix={prefixIcon}
        addonBefore={{ render: prefixText, custom: false }}
        suffix={suffixIcon}
        addonAfter={{ render: suffixText, custom: false }}
        onChange={(value) => {
          setValue(value)
          new Promise((resolve) => {
            handleUpdateDsl({ value })
            resolve(true)
          }).then(() => {
            handleValidate(value)
            handleOnChange?.()
          })
        }}
        showCount={showCharacterCount}
        borderColor={colorScheme}
        allowClear={allowClear}
        onClear={() => {
          handleUpdateDsl({ value: "" })
        }}
        maxLength={maxLength}
        minLength={minLength}
      />
    )
  },
)
WrappedInput.displayName = "WrappedInput"

export const InputWidget: FC<InputWidgetProps> = (props) => {
  const {
    value,
    placeholder,
    disabled,
    readOnly,
    prefixIcon,
    prefixText,
    suffixIcon,
    suffixText,
    showCharacterCount,
    colorScheme,
    displayName,
    handleUpdateDsl,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    allowClear,
    minLength,
    maxLength,
    labelPosition,
    labelFull,
    label,
    labelAlign,
    labelWidth = 33,
    labelCaption,
    labelWidthUnit,
    required,
    labelHidden,
    tooltipText,
    pattern,
    regex,
    customRule,
    hideValidationMessage,
    updateComponentHeight,
    validateMessage,
  } = props

  const inputRef = useRef<HTMLInputElement>(null)

  const inputWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputWrapperRef.current) {
      updateComponentHeight(inputWrapperRef.current?.clientHeight)
    }
  }, [validateMessage, labelPosition, updateComponentHeight])

  const handleValidate = useCallback(
    (value?: string) => {
      const message = handleValidateCheck({
        value,
        pattern,
        regex,
        minLength,
        maxLength,
        required,
        customRule,
      })
      const showMessage =
        !hideValidationMessage && message && message.length > 0
      if (showMessage) {
        handleUpdateDsl({
          validateMessage: message,
        })
      } else {
        handleUpdateDsl({
          validateMessage: "",
        })
      }
    },
    [
      customRule,
      handleUpdateDsl,
      hideValidationMessage,
      maxLength,
      minLength,
      pattern,
      regex,
      required,
    ],
  )
  useEffect(() => {
    handleUpdateGlobalData?.(displayName, {
      value,
      placeholder,
      disabled,
      readOnly,
      prefixIcon,
      prefixText,
      suffixIcon,
      suffixText,
      showCharacterCount,
      colorScheme,
      allowClear,
      minLength,
      maxLength,
      focus: () => {
        inputRef.current?.focus()
      },
      setValue: (value: boolean | string | number | void) => {
        handleUpdateDsl({ value })
      },
      clearValue: () => {
        handleUpdateDsl({ value: undefined })
      },
      validate: () => {
        handleValidate(value)
      },
      clearValidation: () => {},
    })
    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    value,
    placeholder,
    disabled,
    readOnly,
    prefixIcon,
    prefixText,
    suffixIcon,
    suffixText,
    showCharacterCount,
    colorScheme,
    displayName,
    allowClear,
    minLength,
    maxLength,
    handleUpdateGlobalData,
    handleUpdateDsl,
    handleDeleteGlobalData,
    handleValidate,
  ])
  return (
    <div ref={inputWrapperRef}>
      <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
        <div css={applyLabelAndComponentWrapperStyle(labelPosition)}>
          <Label
            labelFull={labelFull}
            label={label}
            labelAlign={labelAlign}
            labelWidth={labelWidth}
            labelCaption={labelCaption}
            labelWidthUnit={labelWidthUnit}
            labelPosition={labelPosition}
            required={required}
            labelHidden={labelHidden}
            hasTooltip={!!tooltipText}
          />
          <WrappedInput
            {...props}
            ref={inputRef}
            handleValidate={handleValidate}
          />
        </div>
      </TooltipWrapper>

      <div
        css={applyValidateMessageWrapperStyle(
          labelWidth,
          labelPosition,
          labelHidden || !label,
        )}
      >
        <InvalidMessage validateMessage={validateMessage} />
      </div>
    </div>
  )
}

InputWidget.displayName = "InputWidget"
