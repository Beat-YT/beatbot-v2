// https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Assuming jsSHA has been loaded
/**
 * 
 * @param {string} payload 
 * @param {string} signature 
 * @returns {string}
 */
function generateMMSHash(payload, signature) {
    const salt = "Don'tMessWithMMS";
    const shaObj = new jsSHA("SHA-1", "TEXT", { encoding: "UTF16LE" });

    const raw = payload.substring(10, 20) + salt + signature.substring(2, 10);
    shaObj.update(raw);
    const hash = shaObj.getHash("HEX");

    return hash.slice(4, 20).toUpperCase();
}


function getDefaultPlatform() {
    try {
        const user = navigator.userAgent.toLowerCase();

        if (user.includes('xbox')) {
            return "XBL";
        } else if (user.includes('playstation')) {
            return "PSN";
        } else if (user.includes('nintendo')) {
            return "SWT";
        } else if (user.includes("mobile") || user.includes("android") || user.includes("ios") || user.includes('ipad') || user.includes('iphone')) {
            return "AND";
        } else {
            return "WIN";
        }
    } catch {
        return "WIN";
    }
}

class ApiError extends Error {
    /**
     * 
     * @param {errorResponse} error 
     */
    constructor(error) {
        super(error.errorMessage);

        this.errorCode = error.errorCode;
        this.errorMessage = error.errorMessage;
        this.numericErrorCode = error.numericErrorCode;
        this.originatingService = error.originatingService;
        this.messageVars = error.messageVars;
        this.intent = error.intent;
    }
}

/**
 * 
 * @param {Response} response 
 */
function isJSONresponse(response) {
    const contentType = response.headers.get('Content-Type');
    return contentType.startsWith('application/json');
}

/**
 * 
 * @param {Response} response 
 */
async function parseError(response) {
    if (isJSONresponse(response)) {
        const data = await response.json();
        return new ApiError(data);
    } else {
        return new ApiError(
            {
                errorCode: 'errors.epicgames.non_json_error_response',
                errorMessage: `An error occurred while communicating with the game servers: HTTP ${response.status} response from ${response.url}`,
                intent: 'unknown',
                originatingService: 'unknown',
                numericErrorCode: null
            }
        )
    }
}

/**
 * 
 * @param {Record<string, string>}
 * @returns {{c: string, v: string, dE: number}[]}
 */
function mapVariants(variants) {
    return Object.entries(variants).map(
        ([channel, tag]) => {
            return {
                c: channel,
                v: tag,
                dE: 0
            }
        }
    );
}

function saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function mapVerifyToken(verifyToken) {
    return {
        access_token: verifyToken.token,
        account_id: verifyToken.account_id,
        app: verifyToken.app,
        client_id: verifyToken.client_id,
        client_service: verifyToken.client_service,
        device_id: verifyToken.device_id,
        displayName: verifyToken.display_name,
        expires_at: verifyToken.expires_at,
        expires_in: verifyToken.expires_in,
        in_app_id: verifyToken.in_app_id,
        internal_client: verifyToken.internal_client,
        token_type: verifyToken.token_type
    }
}

function buildDefaultMeta() {

}

/**
 * @param {Array} arr 
 * @param {number} len 
 * @returns {any[][]}
 */
function splitArrayIntoChunksOfLen(arr, len) {
    var chunks = [], i = 0, n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }
    return chunks;
}

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
var lut = []; for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
function generateUUID() {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
}


function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}
