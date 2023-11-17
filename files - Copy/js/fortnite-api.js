/**
 * @param {string} url
 * @returns {Promise<FortniteAPI['data']>}
 */
async function fetchAPI(url) {
    const response = await fetch(url);

    if (response.status != 200) {
        if (isJSONresponse(response)) {
            const data = await response.json();

            if (typeof data.error == 'string') {
                throw new Error(`There was an error while fetching fortnite-api: "${data.error}" from ${response.url}`);
            }
            else {
                throw new Error(`There was an error while fetching fortnite-api: HTTP status ${data.error} from ${response.url}. Expected HTTP status 200`);
            }
        } else {
            throw new Error(`There was an error while fetching fortnite-api: HTTP status ${data.error} from ${response.url}. Expected HTTP status 200`);
        }
    }

    if (!isJSONresponse(response)) {
        throw new Error(`There was an error while fetching fortnite-api: non json response from ${response.url}`);
    }

    return (await response.json()).data;
}


