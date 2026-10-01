# Equal-size boxes

Mermaid sizes every box to fit its own text, so a row of outputs with
different label lengths comes out uneven. Mermaid has no setting for a fixed
box size.

Workaround: wrap each label in a fixed-size HTML block. Give every box in the
row the same width and height, and centre the text vertically:

```mermaid
---
config:
  theme: redux-color
---
flowchart LR
    J[Decision] --> A1["<div style='width:200px;height:48px;display:flex;flex-direction:column;justify-content:center'>Choice: picked option<br/>+ probability of each</div>"]
    J --> A2["<div style='width:200px;height:48px;display:flex;flex-direction:column;justify-content:center'>Score</div>"]
```

- Set the width to fit the longest label in the row. Text that doesn't fit is
  cut off, not wrapped.
- Works in mermaid.live and the bundled renderer, which use HTML labels.
- GitHub and some other viewers strip inline styles, so the boxes go back to
  fitting their text there. Say so when you use it.
