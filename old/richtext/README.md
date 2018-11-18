# richtext

Rich Text Editor

## Requirements

0. Ability to add standard inline and line styles
1. Ability to embed arbitrary objects, both inline and block
2. Ability to style caret and selections
3. Ability to render overlays around caret or selections
4. Ability to preserve attention placement when things change
4. Agnostic to actual storage structures.
4. React

## Implmentation

The modular implementation has a few layers:

1. RichTextCore: core component which renders the DOM + has caret/selection positioning APIs
2. Selection: module which implements navigation and selection related methods
3. KeyboardInput: module which maps keyboard events
4. MouseInput: module which maps mouse events
5. RichTextOverlays: component which renders rich text overlays (including caret/selection)
6. RichTextView: component which wraps everything and handles placement preservation
