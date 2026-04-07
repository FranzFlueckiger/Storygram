# FAQ

## Storygram is not showing up

- Check the browser console. If you see **"Storygram: No data after filtering"**, all events or actors were removed by your filters — relax the filter ranges.
- If you set the `root` option, make sure it is a valid CSS selector pointing to an element that exists in the DOM when `draw()` is called.
- Set `verbose: true` in the config to get detailed logs about data import, filtering, and the optimizer.

## Storygram is appended at the end of the page

By default, the Storygram appends to `<body>`. Set `root` to a CSS selector targeting the container you want:

```typescript
const config: Config = {
  // ...
  root: '#my-chart-container',
}
```

## Storygram changes size between renders

The chart dimensions are derived from the number of visible events and actors. If your filters allow very different sets of data through depending on context, the chart will change size accordingly. Tighten your filter ranges to keep the visible data stable.

## Events are too close together

- Increase `eventPadding` (default `40`).
- Set `eventValueScaling` to a low value (e.g. `0.01`) to switch from value-proportional spacing to uniform spacing.
