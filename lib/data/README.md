# Data Processing Utils — Notes

## CSV Parsing
- Uses PapaParse in streaming mode (1MB chunks)
- Limits to 50,000 rows (adjustable via `maxRows` parameter)
- Detects column types by sampling first 1000 rows

## Column Type Inference
- **number**: majority of sampled cells are numeric
- **date**: string matches common date formats (YYYY-MM-DD, MM/DD/YYYY)
- **text**: fallback

## Aggregation Logic
Executed in-memory on client. No SQL needed.

```ts
aggregateData(data, xCol, yCol, aggregation, groupCol?)
// Returns array: { name: string, value: number, group?: string }
```

## Filters
Applied before aggregation. Simple predicate functions support:
- equals (exact match)
- contains (substring)
- gt / lt (numeric comparisons)
- between (range)
