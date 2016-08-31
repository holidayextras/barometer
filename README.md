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

### Taking Readings

* `barometer.gauge(metric, duration)` is a measure of "this event took this long". `metric` is the full metric path, so choose wisely!
* `barometer.count(metric)` is a measure of "this event just happened". `metric` is the full metric path, so choose wisely!
* `barometer.offset(metric)` is a measure of "this event just happened now, relative to pageLoad". The metric path will be prefixed with `pageLoad.[domain].[path].` to keep the measurements inline with those gathered out-of-the-box. This feature is great for digging deeper into the bootstrapping process of a single page application.

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

#### PageChanged
When the page loads, or whenever a navigation event occurs, we log a counter for the page visit and a gauge for how long the page load took. The page load is a measure of the time between the navigation event firing, the event loop lagging for over 25ms and finally the event loop freeing up for 125ms. Basically we wait for the page to get busy, then we wait for it to finish being busy. This provides a measure for how efficient single page applications are whilst out in the wild. The approach is framework agnostic.

#### PageLoad
When the HTML document has loaded, we use `window.performance.{timing,navigation}` for details of the initial page load. They provide measures of network performance and initial DOM performance out in the wild.

#### XhrStats
By subtly altering the behavious of `window.XMLHttpRequest` we can identify every AJAX request made, the destination, the transitioning between states and final response size. This provides a measure of real world API performance, as seen by end users.

#### PageResources
Whenever the page has finished changing (see PageChanged above) we look back through all the new `PerformanceEntry` objects in `window.performance`, filter out the entries that match a user-defined rule set on (domain, path and/or type) and generate metrics for the user-defined events of interest. This provides adjustable measures of real-world performance sliced up in many different ways. Keep reading for how to configure this functionality.

Timings are measured as an offset against the most recent `PageChanged` event, which occurs *after* the page has mutated, and as such all timings will be negative. The recorded values should be interpreted with `0` being the point at which the end user thinks the page is ready. This enables us to fairly measure metrics of all resources across a single page application.

#### OncePageLoaded
A Mechanism for deferring work until the browser has completely finished loading and all processing is completed. It takes a callback and will invoke it once and only once:

1. If the page has already loaded, the callback should be invoked immediately.
2. If the page is still loading, as soon as it has finished both loading and processing any clientside JavaScript, it should invoke the callback.
3. If the page has failed to do anything 6 seconds after the initial page load and the callback has yet to be invoked, it will be invoked.


#### Bandwidth

By downloading a test file for a specified period of time we can report the users bandwidth. This stat is disabled by default, to enable set `barometer.bandwidth` to a truthy value. If it is an object you can specify additional configuration options, each of these example values represents the defaults:

```
barometer.bandwidth = {
  defer: 5, // the number of seconds to defer the test by from the page `load` event
  url: 'https://s3-eu-west-1.amazonaws.com/hx-barometer/test', // an alternative file to download for the test
  size: 10240000, // the size of the test file in bytes
  length: 5, // the number of seconds to run the test for
  every: 60 * 60 * 24 // how ofter to run the test in seconds, note even with a low value it will run a maximum of once per request
}
```

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
  count: function (metric) { },
  gauge: function (metric, value) { },
  offset: function(metric) { },
  onPageChanged: function(callback) { },
  oncePageLoaded: function(callback) { }
}
```
Other scripts on the page can use this, drastically reducing the barriers to entry for logging application metrics.

### Configuring PageResource metrics

At it's heart, simply attach an array to `window.barometer.resources`. Each object in the array is a filter which details which resources to match on, and which metrics to gather.

```
window.barometer.resources = [
  {
    domain: 'example.com',
    path: /.*-assets(\.gz)\.js$/,
    metrics: [ 'startTime', 'duration' ],
    rename: 'assets.js'
  }
]
```

#### Filtering

The following properties are all optional, you can include as many or as few as you like:

 * domain - A string or RegEx of the domain as seen by the end user.
 * path - A string or RegEx of the URL path as seen by the end user.
 * type - A string or RegEx of the type of `PerformanceEntry` object.

#### Gathering

The `metrics` property controls which metrics should be gathered. Possible options are: `connectEnd`, `connectStart`, `domainLookupEnd`, `domainLookupStart`, `duration`, `fetchStart`, `redirectEnd`, `redirectStart`, `requestStart`, `responseEnd`, `responseStart`, `secureConnectionStart`, `startTime`, `workerStart`.

### What could a complete metrics stack look like?

1. [barometer](https://github.com/holidayextras/barometer) - client-side metric gathering tool
2. A DIY service to receive and expand metrics, and provide application security.
3. [statsd](https://github.com/etsy/statsd) - A network daemon for statistic aggregation
4. [Graphite](https://graphiteapp.org/#gettingStarted) - An enterprise-ready monitoring tool
5. [Grafana](http://grafana.org/) - A tool for querying and visualizing time series and metrics

### How do the metrics relate to one another?

![barometer metrics](https://cloud.githubusercontent.com/assets/3055120/17925021/1e8788d8-69e3-11e6-9b66-0a8737d0a07b.png)
