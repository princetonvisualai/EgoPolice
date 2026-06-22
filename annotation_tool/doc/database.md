# Database

The application uses five MySQL tables: [`user`](#user), [`video`](#video),
[`label`](#label), [`label_group`](#label_group), and [`user_video`](#user_video).
The full `CREATE TABLE` statements live in [INITIALIZE](INITIALIZE.md); this page
explains what each column means.

## High-level

- `user` stores data for user accounts (id, password, etc)
- `video` stores basic data of videos (duration, file location, etc)
- `label` stores action labels
- `user_video` is a mapping table for annotation assignment. It maps a user to a video and a label group.
- `label_group` joins multiple action labels into a single group.


## `user`

Annotator and admin accounts.

| Column | Type | Meaning |
|--------|------|---------|
| `index` | INT UNSIGNED, PK, auto | Index |
| `id` | VARCHAR(255), unique | Login name. The admin account uses `id = 'admin'`. |
| `password` | VARCHAR(255) | bcrypt hash from PHP `password_hash()` (verified with `password_verify()`). Passwords are never stored plaintext. |
| `role` | VARCHAR(255) | `'annotator'` or `'admin'`. When logged-in, admins land on `manage.php`; annotators on `index.php`. |
| `note` | LONGTEXT, nullable | Free-text note about the user, visible only to admins. |

---

## `video`

Videos available for annotation. A row is either an **original** (`original = 1`)
or a **partial clip** (`original = 0`) that references an original.

| Column | Type | Meaning |
|--------|------|---------|
| `index` | INT, PK, auto | Index |
| `name` | VARCHAR(255), unique | Human-readable video name / identifier. |
| `description` | VARCHAR(255), nullable | Optional description. |
| `webp_location` | VARCHAR(255) | Directory (relative to web root) holding the per-second WebP frame thumbnails, named `00001.webp`, `00002.webp`, … |
| `mp4_location` | VARCHAR(255) | Path/URL to the MP4. |
| `second` | INT | Length in seconds; equals the number of WebP frames. |
| `original` | TINYINT(1), default 0 | `1` = full source video, `0` = partial clip. |
| `start_time` | INT | For a partial clip, the start second within the original (0-based). |
| `end_time` | INT | For a partial clip, the end second within the original (inclusive). |
| `original_index` | INT | For a partial clip, the `video.index` of the original it was clipped from. |

For an original video, `start_time`/`end_time` span the whole clip and
`original_index` is unused (stored as `0`).


## `label`

A single annotatable concept (e.g. "Running", "Handcuffing"). Each label can be grouped under an _entity_. In our paper, action labels are either `BWC Wearer`, `Civilian`, or `Other Officers`. Additionally, labels can be nested up to 1 level.
Also, our initial annotation design was done with 3 choices: `Explicit` (as in explicitly visible), `No`, and `Implicit` (not directly visible, but it can be inferred that the action is happening). If you want binary annotation, set `explicit` to 1. 

| Column | Type | Meaning |
|--------|------|---------|
| `index` | INT, PK, auto | Index |
| `description` | VARCHAR(255) | Description of the label. It is shown when you hover your cursor on the label. |
| `entity` | VARCHAR(255) | Action labels can be grouped. In our paper, they are grouped by `entities`, e.g., BWC Wearer. |
| `name` | VARCHAR(255) | The label's display name. E.g., `Running` |
| `order` | INT | Action labels are sorted by the values here. |
| `skip` | TINYINT(1) | `1` = the checkbox is disabled (a non-selectable header/parent row); `0` = selectable. |
| `under` | INT | `0` for a top-level label, otherwise the `label.index` of its parent (one level of nesting only). |
| `explicit` | INT | `1` = "explicit-only": the checkbox toggles between *off* and *explicit* (no *implicit* state). `0` = cycles off → explicit → implicit. |

**Annotation states.** When annotating, each label/frame can be *off*, *explicit*
(directly visible), or *implicit* (inferred/ambiguous). The `explicit` flag
removes the *implicit* option for labels where an inferred reading makes no sense.

---

## `label_group`

When assigning jobs to annotators, you would want them to annotate a video with some set of action labels. In our tool, we require these action labels to be grouped, and annotators are assigned with a _label group_. Each label must be under one label group. A label cannot have no label group, and it cannot be in 2 or more groups. 

| Column | Type | Meaning |
|--------|------|---------|
| `index` | INT, PK, auto | Index |
| `group_index` | INT | The label-group id. Shared by every label in the group; referenced by `user_video.label_group_idx`. |
| `label_index` | INT | `label.index`. |
| `name` | TEXT | The group's display name (same value on every row of the group). |

---

## `user_video`

The assignment table: who annotates what, with which label group. We expect this table to be dynamic; the admin will assign/de-assign videos to annotators. There are no logs of previous assignments, so make sure to receive annotation files from the annotators before de-assigning. 

| Column | Type | Meaning |
|--------|------|---------|
| `index` | INT, PK, auto | Index |
| `user_idx` | INT | the assigned annotator. (`user.index`) |
| `video_idx` | INT | the assigned video. (`video.index`)|
| `label_group_idx` | INT | The `label_group.group_index` to use for this assignment (note: this matches `group_index`, **not** `label_group.index`). |

---

## Notes
- There are **no foreign-key constraints** defined; the relationships above are
  enforced only by application code.
