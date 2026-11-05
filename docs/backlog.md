# Backlog

What the consuming apps have asked for and the system does not do yet, in rough priority order. Each
item lands as its own `minor` PR with stories, an axe test and a README row. Add to the bottom; strike
through when shipped.

| Item                  | Notes                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Toolbar` Home/End    | Base UI's Toolbar moves with arrows and loops; Home and End do nothing. Check upstream (`@base-ui/react` Toolbar / CompositeRoot) before adding a key handler here. |
| `Menu` submenus       | Base UI has `Menu.SubmenuRoot` + `SubmenuTrigger`; needs the chevron, hover intent and the positioner class.                                                        |
| `Select multiple`     | Base UI `Select` supports `multiple`; needs a value renderer for several labels and a chip-style trigger.                                                           |
| `Table` row selection | A checkbox column: `Table.SelectionHeader` (all/none/indeterminate) and `Table.SelectionCell`, with `aria-selected` on the row.                                     |
| `Toast`               | A status region (`role="status"` / `alert`), stacking, auto-dismiss with pause on hover and focus, `--sc-z-toast`. Base UI has `Toast`.                             |
| `Popover`             | Non-modal popup for a small form or a legend; Base UI `Popover`, `--sc-z-dropdown`.                                                                                 |
| `Pagination`          | Page list with prev/next, current page as `aria-current`.                                                                                                           |
| `Avatar`              | Image with initials fallback, `size`, `Avatar.Group`.                                                                                                               |
| `Dialog` nested       | Two dialogs stack by DOM order today; a nested one should dim the parent (`data-nested-dialog-open`).                                                               |

Shipped from this list: Chip, Disclosure, EmptyState, Skeleton, `IconButton render`, `Toolbar.Link`,
`Select clearable`, `Textarea variant="code"`, `Dialog variant="sheet"` (0.2.0 line).
