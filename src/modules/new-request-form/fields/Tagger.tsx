import type {
  IComboboxProps,
  ISelectedOption,
} from "@zendeskgarden/react-dropdowns.next";
import {
  Field as GardenField,
  Label,
  Hint,
  Combobox,
  Message,
  Option,
  OptGroup,
} from "@zendeskgarden/react-dropdowns.next";
import { Span } from "@zendeskgarden/react-typography";
import type { Field } from "../data-types";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNestedOptions } from "./useNestedOptions";
import { EmptyValueOption } from "./EmptyValueOption";
import { debounce } from "lodash";

interface TaggerProps {
  field: Field;
  onChange: (value: string) => void;
}

export function Tagger({ field, onChange }: TaggerProps): JSX.Element {
  const { label, options, error, value, name, required, description } = field;
  const { currentGroup, isGroupIdentifier, setCurrentGroupByIdentifier } =
    useNestedOptions({
      options,
      hasEmptyOption: true,
    });

  const selectionValue = (value as string | undefined) ?? "";
  const [inputValue, setInputValue] = useState(selectionValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasOpenedOnce = useRef(false);

  useEffect(() => {
    if (wrapperRef.current && required) {
      const combobox = wrapperRef.current.querySelector("[role=combobox]");
      combobox?.setAttribute("aria-required", "true");
    }
  }, [wrapperRef, required]);

  // Introduced debouncing to improve performance and reduce excessive re-renders while typing.
  const debouncedSetInputValue = useMemo(
    () => debounce(setInputValue, 300),
    []
  );

  const handleChange: IComboboxProps["onChange"] = (changes) => {
    if (
      typeof changes.selectionValue === "string" &&
      isGroupIdentifier(changes.selectionValue)
    ) {
      setCurrentGroupByIdentifier(changes.selectionValue);
      return;
    }
    if (typeof changes.selectionValue === "string") {
      onChange(changes.selectionValue);
      setInputValue(""); // Clear input after selection to allow new search
      document.activeElement?.blur(); // Remove focus from dropdown to prevent accidental interactions
    }
    if (
      typeof changes.inputValue === "string" &&
      typeof changes.selectionValue !== "string"
    ) {
      debouncedSetInputValue(changes.inputValue);
    }
    if (
      changes.type === "option:click" &&
      changes.selectionValue === undefined
    ) {
      setInputValue(selectionValue);
    }
    if (changes.isExpanded !== undefined) {
      setIsExpanded(changes.isExpanded);
    }

    if (changes.isExpanded === true && !hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      setInputValue("");
    }
  };

  // Optimized filtering logic using useMemo for better performance
  const filteredOptions = useMemo(
    () =>
      currentGroup.options.filter(
        (option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.value.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [inputValue, currentGroup.options]
  );

  return (
    <GardenField>
      <Label>
        {label} {required && <Span aria-hidden="true">*</Span>}
      </Label>
      {description && (
        <Hint dangerouslySetInnerHTML={{ __html: description }} />
      )}
      <Combobox
        ref={wrapperRef}
        inputProps={{ required, name }}
        isEditable={true}
        isAutocomplete
        validation={error ? "error" : undefined}
        onChange={handleChange}
        selectionValue={selectionValue}
        inputValue={inputValue}
        renderValue={({ selection }) =>
          (selection as ISelectedOption | null)?.label ?? <EmptyValueOption />
        }
        isExpanded={isExpanded}
      >
        {currentGroup.type === "SubGroup" && (
          <Option {...currentGroup.backOption} />
        )}
        {currentGroup.type === "SubGroup" ? (
          <OptGroup aria-label={currentGroup.name}>
            {currentGroup.options.map((option) => (
              <Option key={option.value} {...option}>
                {option.menuLabel ?? option.label}
              </Option>
            ))}
          </OptGroup>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <Option key={option.value} {...option} />
          ))
        ) : (
          <Option isDisabled>No results found</Option>
        )}
      </Combobox>
      <input type="hidden" name={name} value={selectionValue} />
      {error && <Message validation="error">{error}</Message>}
    </GardenField>
  );
}
