# Chronometer

The Chronometer project was created to help developers measure the time worked, so the plugin keeps track of the changes in the editor buffers, if the buffers go unchanged for a long time, this time can be configured, it pauses the timer so that it does not be counted overtime.

It is very simple, and easy to pass unnoticed, see the figure below:

![Atom with chronometer working](https://github.com/rodrigopmatias/atom-chronometer/blob/b4de0f4c4c14caa1a366009faf3e1ce4f42c71f3/images/window-of-work.png?raw=true)

Now with more detail in the bottom bar:

![Detail of chronometer working](https://github.com/rodrigopmatias/atom-chronometer/blob/0e9a3b9fdd4ee3581d9b84f16bc5bc23181de848/images/chronometer-working-with-value.png?raw=true)

The chronometer still has several settings such as the possibility to inform the value of an hour of your work, so that it can estimate how much time was invested in each session of code. See the figure below:

![Settings](https://github.com/rodrigopmatias/atom-chronometer/blob/b4de0f4c4c14caa1a366009faf3e1ce4f42c71f3/images/chronometer-configuration.png?raw=true)

In addition to the global settings, in each project we can also have a <code> .chronometer.json</code> configuration file where we can make private definitions for the project in question, see:

<pre><code class="json">{
  "currencySymbol": "BTC",
  "hourValue": 0.0012,
  "locale": "en-us",
  "fractionDigits": 6
}</code></pre>
