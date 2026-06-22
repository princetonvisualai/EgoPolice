Here, we give the code to initialize the annotation tool

# Initialization

## Make Config
This file should contain your database URL and your password

```php
# config.php
<?php
return [
    // Database connection
    'db_host' => 'db.example.com',
    'db_user' => '{your username}',
    'db_pass' => '{user password}',
    'db_name' => '{db name}',
    
    // Set true only in development. When false, errors are logged, not shown.
    'debug' => false,
];

```

## Make Tables for the database

Go to your database and make the following: 

```sql
-- Annotators and admins. The admin account uses id = 'admin'.
CREATE TABLE `user` (
  `index`    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id`       VARCHAR(255) NOT NULL,   -- login name
  `password` VARCHAR(255) NOT NULL,   -- password_hash() output
  `role`     VARCHAR(255) NOT NULL,   -- 'annotator' | 'admin'
  `note`     LONGTEXT DEFAULT NULL,   -- admin-only note
  PRIMARY KEY (`index`),
  UNIQUE KEY `id` (`id`)
);

-- Videos. original=1 rows are full source videos; original=0 rows are
-- partial clips that reference an original via original_index.
CREATE TABLE `video` (
  `index`          INT NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(255) NOT NULL,
  `description`    VARCHAR(255) DEFAULT NULL,
  `webp_location`  VARCHAR(255) NOT NULL,   -- dir of per-second WebP frames
  `mp4_location`   VARCHAR(255) NOT NULL,   -- path/URL to the MP4
  `second`         INT NOT NULL,            -- length in seconds (== frame count)
  `original`       TINYINT(1) DEFAULT 0,    -- 1 = original, 0 = partial clip
  `start_time`     INT NOT NULL,            -- clip start second (partial)
  `end_time`       INT NOT NULL,            -- clip end second (partial)
  `original_index` INT NOT NULL,            -- FK to video.index when original=0
  PRIMARY KEY (`index`),
  UNIQUE KEY `name` (`name`)
);

-- One label (a single annotatable concept).
CREATE TABLE `label` (
  `index`       INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `entity`      VARCHAR(255) NOT NULL,   -- entity name, e.g. 'Bodycam Wearer'
  `name`        VARCHAR(255) NOT NULL,
  `order`       INT NOT NULL,   -- display order
  `skip`        TINYINT(1) NOT NULL,   -- 1 = non-selectable header row
  `under`       INT NOT NULL,   -- parent label.index, or 0 for top-level
  `explicit`    INT NOT NULL,   -- 1 = only-explicit label
  PRIMARY KEY (`index`)
);

-- Groups labels into a named set, identified by group_index.
-- One row per (group, label) pair.
CREATE TABLE `label_group` (
  `index`       INT NOT NULL AUTO_INCREMENT,
  `group_index` INT NOT NULL,   -- the label group id
  `label_index` INT NOT NULL,   -- FK to label.index
  `name`        TEXT NOT NULL,  -- group name
  PRIMARY KEY (`index`)
);

-- Assignment: which user annotates which video with which label group.
CREATE TABLE `user_video` (
  `user_idx`        INT NOT NULL,   -- FK to user.index
  `video_idx`       INT NOT NULL,   -- FK to video.index
  `label_group_idx` INT NOT NULL,   -- FK to label_group.group_index
  `index`           INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`index`)
);
```

### Make Admin Account

Login verifies passwords with PHP's `password_verify()`, so the stored value must
be a **bcrypt hash**, not plaintext. Generate one for `admin`:

```bash
php -r "echo password_hash('admin_password', PASSWORD_DEFAULT), \"\n\";"
```

Then insert the admin row using that hash (the value below is a working hash of
`admin` — yours will differ, which is fine):

```sql
INSERT INTO `user` (`id`, `password`, `role`)
VALUES ('admin', '$2y$10$VtOWD1BHMHHnkXBxSBtVD.Dbvda.4zyBjbJZd.BJ1tAXE4qrHF42.', 'admin');
```

This creates an account with username `admin` and password `admin_password`.
**Use your own password.** 
The admin password can only be changed directly through MySQL.