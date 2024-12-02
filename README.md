# react-simple-code-hint

[![MIT License][license-badge]][license]
[![Version][version-badge]][package]
[![Bundle size (minified + gzip)][bundle-size-badge]][bundle-size]

A wrapper for [react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor) that adds code hints.

<a href="https://raw.githubusercontent.com/sbondaryev/react-simple-code-hint/main/demo/demo.gif"><img src="https://raw.githubusercontent.com/sbondaryev/react-simple-code-hint/main/demo/demo.gif" width="400"></a>

## Usage

To use `react-simple-code-hint`, follow these steps:

1. **Install the package**:

   ```sh
   npm install react-simple-code-hint
   ```

   or

   ```sh
   yarn add react-simple-code-hint
   ```

2. **Import the necessary modules**:

   ```jsx
   import React, { useState } from "react";
   import Editor from "react-simple-code-editor";
   import Hint from "react-simple-code-hint";
   import { highlight, languages } from "prismjs";
   import "prismjs/components/prism-javascript";
   // ...other prismjs syntax imports
   ```

3. **Wrap the `Editor` component with the `Hint` component**:

   ```jsx
   const MyCodeEditor = () => {
     const [code, setCode] = useState(`
       import React from "react";
       import ReactDOM from "react-dom";

       function App() {
         return (
           <h1>Hello world</h1>
         );
       }

       ReactDOM.render(<App />, document.getElementById("root"));
     `);

     return (
       <Hint hints={["hint1", "hint2", "other_hints"]}>
         <Editor
           value={code}
           onValueChange={(code) => setCode(code)}
           highlight={(code) => highlight(code, languages.jsx!, "jsx")}
           padding={10}
           style={{
             fontFamily: '"Fira code", "Fira Mono", monospace',
             fontSize: 12,
           }}
         />
       </Hint>
     );
   };

   export default MyCodeEditor;
   ```

4. **Render your component**:

   ```jsx
   import React from "react";
   import { createRoot } from "react-dom/client";
   import MyCodeEditor from "./MyCodeEditor";

   const container = document.getElementById("root");
   const root = createRoot(container!);

   root.render(<MyCodeEditor />);
   ```

This setup will provide a code editor with customizable code hints.

### `Hint` Component Properties

The `Hint` component provides the following properties:

- **children**: `React.ReactNode` (required)

  - The child component to be wrapped by the `Hint` component. This should be an `Editor` component from the `react-simple-code-editor` package.

- **hints**: `string[]` (required)

  - An array of strings representing the hints to be displayed.

- **styles**: `object` (optional)
  - An object representing the inline styles to be applied to various parts of the hint component. It includes:
    - **Container**: `CSSProperties`
      - Styles for the container that holds the hints.
    - **Hint**: `CSSProperties`
      - Styles for each individual hint.
    - **SelectedHint**: `CSSProperties`
      - Styles for the currently selected hint.
    - **Root**: `CSSProperties`
      - Styles for the root wrapper of the hint and editor components and normally does not need to be styled by the user.

<!-- badges -->

[license-badge]: https://img.shields.io/npm/l/react-simple-code-hint.svg?style=flat-square?cachebuster=1
[license]: https://opensource.org/licenses/MIT
[version-badge]: https://img.shields.io/npm/v/react-simple-code-hint.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-simple-code-hint
[bundle-size-badge]: https://img.shields.io/bundlephobia/minzip/react-simple-code-hint.svg?style=flat-square
[bundle-size]: https://bundlephobia.com/result?p=react-simple-code-hint
