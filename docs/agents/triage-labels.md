# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Canonical role    | Label in our tracker | Meaning                                  |
| ----------------- | -------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`    | Requires human implementation            |
| `wontfix`         | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## Note on current label state

Only `wontfix` exists in this repo today. The other four labels are created on first use — `gh issue edit <number> --add-label "<name>"` will fail if the label is missing, so create it first with e.g.:

```
gh label create needs-triage --description "Maintainer needs to evaluate" --color FBCA04
```

Edit the right-hand column above if you later adopt different label vocabulary.
