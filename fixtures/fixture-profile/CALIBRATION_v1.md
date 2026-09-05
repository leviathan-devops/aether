# CALIBRATION_v1

- batteryVersion: 9c257e2200db555ec0b29b396bd2769162796c481c12e492ac3218c57a3bee21
- dryRun: true
- calibratedAt: 1786559868892
- excludedIds: []

## Records

| predicateId | verdict | failedTest | fire | silent |
|---|---|---|---|---|
| P6 | CALIBRATED | - | FIRED | SILENT |

## Coverage note

all predicates calibrated — zero exclusions

```jsonc
{
  "batteryVersion": "9c257e2200db555ec0b29b396bd2769162796c481c12e492ac3218c57a3bee21",
  "dryRun": true,
  "calibratedAt": 1786559868892,
  "excludedIds": [],
  "records": [
    {
      "predicateId": "P6",
      "fire": {
        "fixtureAnchor": "src/engine.ts:12",
        "fired": true,
        "evidence": "fired on 1/1 fire fixtures (src/engine.ts:12:HIT)"
      },
      "silent": {
        "goldenFixture": "gold-5-of-5",
        "findings": 0,
        "evidence": ""
      },
      "verdict": "CALIBRATED",
      "calibratedAt": 1786559868892
    }
  ],
  "coverageNote": "all predicates calibrated — zero exclusions"
}
```
