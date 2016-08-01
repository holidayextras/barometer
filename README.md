# barometer

barometer is a very small `2.4KB` script that will automatically generate browser-side performance metrics and forward them in an efficient manner to a collection service.

![https://saucelabs.com/browser-matrix/theninj4.svg](https://saucelabs.com/browser-matrix/theninj4.svg)

### Motivation / Justification / Rationale

Every website monitoring tool I've seen that is said to work with single page applications latches in to various frameworks in order to generate metrics. The approach taken with this project is to measure end user experience rather than the performance of functions within any particular framework. This enables us to ship a tiny script in the head of our webpages to collect rich data across any type of web page or application.

### Getting Started

1. Grab the script in `/dist/barometer.min.js`.
2. Embed the script in the `<head>` of your webpage, before everything else.
3. Attach the url of your collector service to `window.barometer.url`.

```html
<!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <script type="text/javascript">--PASTE-SCRIPT-HERE--</script>
    <script type="text/javascript">window.barometer.url='https://foobar'</script>
    ...
```

*IMPORTANT* - The HTML document MUST contain a `<meta>` tag indicating the page contents are encoded in UTF-8 or the packed JS payload won't work. This project uses a combination of `UglifyJS` and `JSCrush` to provide the smallest possible payload to reduce any impact it may have on page load.

If you want to see the generated metrics in your console, you can set `window.barometer.debug` to any truthy value.

### Metric Payload

Metrics are gathered in the format used by a statsd / graphite / grafana stack - there are two types, gauges and counters. The buffered metric payloads sent to the collection service of your choosing look like this:
```javascript
// Content-Type: application/json
{
  "gauges": {
    "foo.bar.baz": [ 123 ],
    "foo.bar.boo": [ 123 , 456 ]
  },
  "counters": {
    "foo.bar.baz": [ 5 ]
  }
}
```

### What metrics are gathered?

* PageChange - When the page loads, or whenever a navigation event occurs, we log a counter for the page visit and a gauge for how long the page load took. The page load is a measure of the time between the navigation event firing, the event loop lagging for over 25ms and finally the event loop freeing up for 125ms. Basically we wait for the page to get busy, then we wait for it to finish being busy.
* PageLoad - We use `window.performance` to get details of the initial page load.
* XhrStats - We monkey-patch over `XMLHttpRequest` in order to identify every AJAX request, the destination, the transition between states, final response size and timing.

### How are the metrics transmitted?

* Metrics are batched up and dispatched in bulk.
* Whenever a metric is batched, we wait 5 seconds before transmitting the whole batch.
* If a new metric is generated and we're about to send the batch, the timer is reset.
* If we have over 100 metrics, the batch will be sent regardless.
* If the users mouse leave the HTML document, we flush the buffer.
* If the user navigates away from the page, we attempt to flush the buffer.

### Storing Additional Metrics

This module exposes a mechanism for other pieces of Javascript to generate metrics:
```javascript
window.barometer = {
  url: null,
  debug: null,
  count: function (metric),
  gauge: function (metric, value) { },
  onPageChanged: function(callback) { }
}
```
Other scripts on the page can use this, drastically reducing the barriers to entry for logging application metrics.

### What could a complete metrics stack look like?

1. [barometer](https://github.com/holidayextras/barometer) - client-side metric gathering tool
2. A DIY service to receive and expand metrics, and provide application security.
3. [statsd](https://github.com/etsy/statsd) - A network daemon for statistic aggregation
4. [Graphite](https://graphiteapp.org/#gettingStarted) - An enterprise-ready monitoring tool
5. [Grafana](http://grafana.org/) - A tool for querying and visualizing time series and metrics
