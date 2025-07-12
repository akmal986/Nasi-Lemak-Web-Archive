// Get the full domain name (e.g., www.mydomain.com or localhost)
let fullDomain = window.location.hostname;
let domainName = '';

// Check if running on localhost
if (fullDomain === 'localhost') {
    // On localhost, extract 'mydomain' from the first segment after 'localhost'
    let pathParts = window.location.pathname.split('/');
    // Check if the second part exists (it's the 'mydomain' part)
    if (pathParts.length > 1 && pathParts[1]) {
        domainName = pathParts[1];
    }
} else {
    // For live domains, remove 'www.' and TLD
    domainName = fullDomain.replace(/^www\./, '').split('.')[0];
}

// URL of your Google Apps Script Web App
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzvZaiv94GEGj-E-IMbDvmpb1JHnwdzjKnAYXMJxNuEZjBJwMUNpAUzzp3fZtMNK12w/exec';
const sheetName = domainName; // Change this to the sheet you want to retrieve data from
const url = `${googleScriptUrl}?action=read&sheetName=${sheetName}`;

// Fetch data from Google Sheets
fetch(url)
    .then(response => response.json())
    .then(data => {
        const currentTime = Math.floor(Date.now() / 1000); // Get current time as Unix timestamp
        let previewActive = false; // Flag to indicate if a preview is active

        data.records.forEach(record => {
            const dynamicId = record.ID;
            const isPreview = new URLSearchParams(window.location.search).has(dynamicId); // Check if parameter is present in the URL
            const isJs = record.JS;
            const startTime = new Date(record.Start).getTime() / 1000; // Convert to Unix timestamp
            const endTime = new Date(record.End).getTime() / 1000; // Convert to Unix timestamp

            if (isPreview) {
                const scriptWithTimestamp = `${isJs}?${currentTime}`;
                const script = document.createElement("script");
                script.src = scriptWithTimestamp;
                script.type = "module";
                document.head.appendChild(script);
                previewActive = true; // Set flag to indicate a preview is active
                return false; // Break out of forEach
            }
        });

        // If no preview is active, check the time conditions
        if (!previewActive) {
            data.records.forEach(record => {
                const dynamicId = record.ID;
                const isJs = record.JS;
                const startTime = new Date(record.Start).getTime() / 1000; // Convert to Unix timestamp
                const endTime = new Date(record.End).getTime() / 1000; // Convert to Unix timestamp

                if (currentTime >= startTime && currentTime <= endTime) {
                    const scriptWithTimestamp = `${isJs}?${currentTime}`;
                    const script = document.createElement("script");
                    script.src = scriptWithTimestamp;
                    script.type = "module";
                    document.head.appendChild(script);
                    return false; // Break out of forEach
                }
            });
        }
    })
    .catch(error => console.error('Error fetching data:', error));