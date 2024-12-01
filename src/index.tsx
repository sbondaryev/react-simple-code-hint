import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface HintProps {
  children: React.ReactNode;
  hints: string[];
  styles?: {
    Root?: CSSProperties;
    Container?: CSSProperties;
    Hint?: CSSProperties;
    SelectedHint?: CSSProperties;
  };
}

interface EditorProps {
  onValueChange: (value: string) => void;
}

const Hint: React.FC<HintProps> = ({ children, hints, styles }) => {
  const Root = styles?.Root || {};
  const Container = styles?.Container || {};
  const Hint = styles?.Hint || {};
  const SelectedHint = defaultSelectedHintStyle;

  const [filteredHints, setFilteredHints] = useState<string[]>([]);
  const [selectedHintIndex, setSelectedHintIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const hintRef = useRef<HTMLUListElement | null>(null);
  const stateRef = useRef({ filteredHints, selectedHintIndex });
  // Ignore mouse events while keyboard is used to prevent hint selector jumps.
  const inputSourceRef = useRef<"keyboard" | "mouse">("keyboard");

  const applyHint = useCallback(
    (hint?: string) => {
      if (!editorRef.current || !hint) {
        return;
      }
      const code = editorRef.current.value;
      const cursorPosition = editorRef.current.selectionStart;
      const beforeCursor = code.slice(0, cursorPosition);
      const afterCursor = code.slice(cursorPosition);
      const newBeforeCursor = beforeCursor.replace(currentWordRegexp, hint);

      React.Children.map(children, (child) => {
        if (
          React.isValidElement<EditorProps>(child) &&
          child.props.onValueChange
        ) {
          child.props.onValueChange(newBeforeCursor + afterCursor);
        }
      });

      setCursorPosition(newBeforeCursor.length);
      setFilteredHints([]);
    },
    [children]
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const textarea = containerRef.current.querySelector("textarea");
    if (textarea) {
      const handleKeyDown = (e: KeyboardEvent) => {
        inputSourceRef.current = "keyboard";
        const { filteredHints, selectedHintIndex } = stateRef.current;

        if (filteredHints.length > 0) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedHintIndex((prevIndex) => {
              const nextIndex = Math.min(
                prevIndex + 1,
                filteredHints.length - 1
              );
              hintRef.current
                ?.querySelector(`li:nth-child(${nextIndex + 1})`)
                ?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedHintIndex((prevIndex) => {
              const nextIndex = Math.max(prevIndex - 1, 0);
              hintRef.current
                ?.querySelector(`li:nth-child(${nextIndex + 1})`)
                ?.scrollIntoView({ block: "nearest" });
              return nextIndex;
            });
          } else if (e.key === "Enter") {
            e.preventDefault();
            applyHint(filteredHints[selectedHintIndex]);
          }
        }
      };

      const handleClose = () => {
        setFilteredHints([]);
      };

      textarea.addEventListener("keydown", handleKeyDown);
      textarea.addEventListener("click", handleClose);
      editorRef.current = textarea;

      return () => {
        editorRef.current?.removeEventListener("keydown", handleKeyDown);
        editorRef.current?.removeEventListener("click", handleClose);
      };
    }
    return;
  }, [applyHint]);

  useEffect(() => {
    if (filteredHints.length > 0) {
      setSelectedHintIndex(0); // Reset selection
    }
    stateRef.current.filteredHints = filteredHints;
  }, [filteredHints]);

  useEffect(() => {
    stateRef.current.selectedHintIndex = selectedHintIndex;
  }, [selectedHintIndex]);

  useEffect(() => {
    if (!editorRef.current || cursorPosition === -1) {
      return;
    }
    setCursorPosition(-1); // Reset cursor position to trigger re-render at the same value

    editorRef.current.setSelectionRange(cursorPosition, cursorPosition);
    editorRef.current.focus();
  }, [cursorPosition]);

  const onEditorValueChange = (code: string): void => {
    if (!editorRef.current) {
      return;
    }

    const cursorPosition = editorRef.current.selectionStart;
    const beforeCursor = code.slice(0, cursorPosition);
    const match = beforeCursor.match(currentWordRegexp);
    if (!match) {
      setFilteredHints([]);
      return;
    }

    const currentWord = match[0];
    if (!currentWord) {
      setFilteredHints([]);
      return;
    }

    const filteredHints = hints.filter((hint) => hint.startsWith(currentWord));
    if (filteredHints.length > 0) {
      setFilteredHints(filteredHints);
      const { top, left } = getCaretCoordinates(editorRef.current);
      setHintPosition({ top, left });
    }
  };

  const wrapChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (
        React.isValidElement<EditorProps>(child) &&
        child.props.onValueChange
      ) {
        const wrappedOnChange = (value: string) => {
          onEditorValueChange(value);

          const originalOnChange = child.props.onValueChange;
          if (typeof originalOnChange === "function") {
            originalOnChange(value);
          }
        };

        return React.cloneElement(child, { onValueChange: wrappedOnChange });
      }
      return child;
    });
  };

  return (
    <div ref={containerRef} style={{ ...defaultRootStyle, ...Root }}>
      {wrapChildren(children)}
      {filteredHints.length > 0 && (
        <ul
          ref={hintRef}
          style={{
            ...defaultContainerStyle,
            ...Container,
            top: hintPosition.top,
            left: hintPosition.left,
          }}
        >
          {filteredHints.map((hint, index) => (
            <li
              key={hint}
              onClick={() => applyHint(hint)}
              onMouseEnter={() => {
                if (inputSourceRef.current === "mouse") {
                  setSelectedHintIndex(index);
                }
              }}
              onMouseMove={() => {
                inputSourceRef.current = "mouse";
              }}
              style={{
                ...defaultHintStyle,
                ...Hint,
                ...(index === selectedHintIndex ? SelectedHint : {}),
              }}
            >
              {hint}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const defaultRootStyle: CSSProperties = {
  position: "relative",
};

const defaultContainerStyle: CSSProperties = {
  textAlign: "left",
  fontSize: "12px",
  fontFamily: "Fira code, Fira Mono, monospace",
  position: "absolute",
  background: "white",
  border: "1px solid #ccc",
  listStyleType: "none",
  padding: 0,
  margin: 0,
  width: 200,
  zIndex: 100,
  maxHeight: "200px",
  overflowY: "auto",
};

const defaultHintStyle: CSSProperties = {
  padding: "4px 8px",
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
};

const defaultSelectedHintStyle: CSSProperties = {
  backgroundColor: "#EEEEEE",
};

const currentWordRegexp = /\w+\b$/;

const getCaretCoordinates = (
  textarea: HTMLTextAreaElement
): Pick<DOMRect, "top" | "left"> => {
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
  ];

  const text = textarea.value.substring(0, textarea.selectionStart);
  const div = document.createElement("div");

  const styles = window.getComputedStyle(textarea);
  for (const key of properties) {
    // @ts-ignore
    div.style[key] = styles[key];
  }
  div.style.top = "0";
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.overflowWrap = "anywhere";
  div.textContent = text;

  document.body.appendChild(div);
  const span = document.createElement("span");
  span.textContent = "|";
  div.appendChild(span);

  const rect = span.getBoundingClientRect();
  document.body.removeChild(div);

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

export default Hint;
