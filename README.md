# Browser plugin for DNS Lookup


Initial published version 0.93

Description
For a given domain and DKIM selector (optional) a output is generated of the results for the following DNS queries: A, AAA, MX, NS, DKIM, SPF, DMARC, CNAME. IPv6 queries are disabled by default. Also the output can be copied by a single click, you are welcome.

The browser extension will consist of at least these files:

1. manifest.json: The manifest file that describes your extension to the browser.

2. popup.html: The HTML file for the extension's popup UI, where users input the domain and optional DKIM selector.

3. popup.js: The JavaScript file linked from popup.html that handles user input, performs DNS lookups using Cloudflare's DNS over HTTPS API, and displays the results in the popup.


Step 1: Create the Manifest File
Create a file named manifest.json:

Step 2: Create the Popup HTML File
Create a file named popup.html with a simple UI to enter a domain and DKIM selector, and a button to trigger the DNS lookup.

Step 3: Implement the Background Script
Rename the JavaScript code provided above as background.js. Adjust it to interact with the popup UI and execute the DNS lookups when the user submits the form.

Step 4: Load Your Extension into the Browser
Chrome/Edge: Go to chrome://extensions/ (or edge://extensions/ for Edge), enable "Developer mode", and click "Load unpacked". Select the folder containing your extension's files.
Firefox: Go to about:debugging, click "This Firefox", and click "Load Temporary Add-on". Select the manifest file of your extension.