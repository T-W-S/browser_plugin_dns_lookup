/*
    Author: Tom W. Sch
    Created: 02.02.24
    Initial published version 0.93
*/
// Function to perform a DNS lookup for a given type and domain
async function dnsLookup(type, domain) {
    // Construct the URL for the DNS query
    const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`;
    try {
        // Make a fetch request to the DNS server
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/dns-json'
            }
        });
        // Parse the response as JSON
        const data = await response.json();
        // Return the answer if available, otherwise return an empty array
        return data.Answer ? data.Answer.map(record => ({type: record.type, data: record.data})) : [];
    } catch (error) {
        // Log an error message if the DNS lookup fails and return an empty array
        console.error("DNS lookup failed:", error);
        return [];
    }
}

// Function to resolve a domain record to its IP address
async function resolveToIP(record) {
    // Extract the domain from the record
    const domain = record.includes(' ') ? record.split(' ')[1] : record;
    // Perform a DNS lookup for the 'A' record type
    const ips = await dnsLookup('A', domain);
    // Return a comma-separated list of IP addresses
    return ips.map(ip => ip.data).join(', ');
}

// Function to format the label for a domain record
function formatRecordLabel(data, type) {
    // Determine the label based on the content of the record
    if (data.includes('v=spf1')) return 'SPF';
    if (data.includes('v=DKIM1;')) return 'DKIM';
    if (data.includes('v=DMARC1;')) return 'DMARC';
    // Return the actual type if none of the specific conditions are met
    return type;
}

// Function to check domain records for various types
async function checkDomainRecords(domain, selector, includeIPv6) {
    // Get the element where results will be displayed
    const resultsElement = document.getElementById('results');
    // Clear the results element
    resultsElement.innerHTML = '';
    // Disable the copy button initially
    document.getElementById('copyResults').disabled = true;

    // Define the record types to check
    let recordTypes = ['A', 'MX', 'NS', 'CNAME', 'TXT'];
    // Add AAAA record type if requested
    if (includeIPv6) {
        recordTypes.push('AAAA');
    }

    // Iterate over each record type and display results
    for (let type of recordTypes) {
        let results = await dnsLookup(type, domain);
        await displayResults(results, type, domain, resultsElement);
    }

    // Handle DMARC and DKIM records if applicable
    if (selector && selector !== 'default') {
        let dkimResults = await dnsLookup('TXT', `${selector}._domainkey.${domain}`);
        if (dkimResults.length > 0) {
            await displayResults(dkimResults, 'DKIM', domain, resultsElement);
        } else {
            displayNoResults('DKIM', domain, resultsElement, true, selector);
        }
    }

    // Perform DNS lookup for DMARC record
    let dmarcResults = await dnsLookup('TXT', `_dmarc.${domain}`);
    // Display DMARC results
    await displayResults(dmarcResults, 'DMARC', domain, resultsElement);
}

// Function to display domain record results
async function displayResults(results, type, domain, resultsElement) {
    // Iterate over each result and create a div to display it
    for (const result of results) {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-item');
        
        // Determine the label for the record
        let label = formatRecordLabel(result.data, type);
        // Set styles for label and data
        let recordLabelStyle = '<span style="color: lightgrey;">'; 
        let recordDataStyle = '<span style="color: #90ee90;">';

        // Additional info for MX and NS records (resolve to IP)
        let additionalInfo = '';
        if (['MX', 'NS'].includes(type)) {
            additionalInfo = ` (${await resolveToIP(result.data)})`;
        }

        // Format the record for display
        let formattedRecord = type === 'DKIM' && results.length ? 
            `${recordLabelStyle}<strong>DKIM record for ${domain}:</strong></span><br>${recordDataStyle}${result.data}${additionalInfo}</span>` :
            `${recordLabelStyle}<strong>${label} record for ${domain}:</strong></span><br>${recordDataStyle}${result.data}${additionalInfo}</span>`;

        // Set the HTML content of the result div
        resultDiv.innerHTML = formattedRecord;
        // Append the result div to the results element
        resultsElement.appendChild(resultDiv);
    }

    // Enable the copy button if there are results
    document.getElementById('copyResults').disabled = false;
}

// Function to display a message when no results are found
function displayNoResults(type, domain, resultsElement, isDkim = false, selector = '') {
    const noResultDiv = document.createElement('div');
    noResultDiv.classList.add('result-item');
    let message = isDkim ? `No DKIM record found for selector "${selector}"` : `No ${type} record found for ${domain}`;
    let colorStyle = isDkim ? 'lightgrey' : 'lightgrey';
    noResultDiv.innerHTML = `<span style="color: ${colorStyle};"><strong>${type} record for ${domain}:</strong></span><br><span style="color: red;">${message}</span>`;
    resultsElement.appendChild(noResultDiv);
}

// Function to copy results to clipboard
function copyResultsToClipboard() {
    const resultsText = document.getElementById('results').innerText;
    navigator.clipboard.writeText(resultsText).then(() => {
        alert('Results copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

// Event listener for when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the lookup button
    document.getElementById('lookup').addEventListener('click', async function() {
        // Get domain, selector, and IPv6 inclusion preference
        const domain = document.getElementById('domain').value.trim();
        const selector = document.getElementById('selector').value.trim();
        const includeIPv6 = document.getElementById('toggleIPv6').checked;
        // Perform domain record check
        checkDomainRecords(domain, selector, includeIPv6);
    });

    // Initially disable the copy button
    document.getElementById('copyResults').disabled = true;
    // Event listener for the copy button
    document.getElementById('copyResults').addEventListener('click', copyResultsToClipboard);
});
