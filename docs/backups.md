# Firestore data protection

Project: `myskulboot` · database: `(default)` · location: `nam5` (multi-region) · edition: Standard

Managed by Google, no application code involved.

| Protection | Setting | Restorable window |
|---|---|---|
| Point-in-time recovery (PITR) | `POINT_IN_TIME_RECOVERY_ENABLED` | last **7 days**, to the minute |
| Scheduled backups | daily, retention `604800s` (7 days) | any of the last 7 daily backups |

Both were enabled on 2026-11-02. PITR turned on `versionRetentionPeriod` of `604800s`
(one hour of retention is kept before that, which is why `versionRetentionPeriod` was
`3600s` on a fresh project).

## Why this matters

Before this, an accidental overwrite (e.g. a bad import or a mis-keyed update) was
unrecoverable — Firestore keeps no document history of its own. With PITR you can rewind
the whole database to any minute in the last 7 days; the daily backups give a coarser
fallback if a bad write is only noticed after a week.

## Checking the current state

```bash
gcloud firestore databases describe --database="(default)" --project=myskulboot \
  --format="value(pointInTimeRecoveryEnablement,versionRetentionPeriod,earliestVersionTime)"

gcloud firestore backups schedules list --database="(default)" --project=myskulboot
gcloud firestore backups list --location=nam5 --project=myskulboot
```

## Restoring

PITR (whole database, to a timestamp):

```bash
gcloud firestore databases restore \
  --source-database="projects/myskulboot/databases/(default)" \
  --destination-database="projects/myskulboot/databases/restored-$(date +%Y%m%d%H%M)" \
  --snapshot-time="2026-11-02T09:00:00Z" \
  --project=myskulboot
```

A backup:

```bash
gcloud firestore databases restore \
  --source-backup="projects/myskulboot/locations/nam5/backups/<BACKUP_ID>" \
  --destination-database="projects/myskulboot/databases/restored-$(date +%Y%m%d%H%M)" \
  --project=myskulboot
```

Restores always go to a **new** database id, so production keeps running while you verify
the copy. Point the app at it by changing `VITE_FIREBASE_PROJECT_ID` only if you really
intend to switch, otherwise copy the affected documents back with the Admin SDK.

Restoration requires `roles/datastore.restoreAdmin` (Owner/Editor include it).

## Re-creating on a new project

```bash
# point-in-time recovery
gcloud firestore databases update --database="(default)" --project=<PROJECT> \
  --enable-pitr

# daily backups, 7 day retention
gcloud firestore backups schedules create \
  --database="(default)" --project=<PROJECT> \
  --recurrence=daily --retention=7d
```

Backups are billed as storage; for a database this size the cost is negligible, but PITR
also keeps the 7-day version history, which is the larger component.
