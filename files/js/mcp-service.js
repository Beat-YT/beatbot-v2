// 29883529:1:NAE:playlist_defaultduo
// 29883529:1:NAE:playlist_defaultduo

class McpService {
    /**
     * 
     * @param {Token} session 
     */
    constructor(session) {
        this.session = session;
    }

    /**
     * @returns {Promise<Mcp.Ticket>}
     */
    async getTicket(partyPlayerIds, partyId, PartyMatchmakingInfo) {
        const parms = new URLSearchParams(
            {
                "partyPlayerIds": partyPlayerIds,
                "bucketId": `${PartyMatchmakingInfo.buildId}:${PartyMatchmakingInfo.playlistRevision}:${PartyMatchmakingInfo.regionId}:${PartyMatchmakingInfo.playlistName.toLowerCase()}`,
                "player.platform": "Windows",
                "player.option.preserveSquad": "false",
                "player.option.crossplayOptOut": "false",
                "player.option.partyId": partyId,
                "player.option.splitScreen": "false",
                "party.WIN": "true",
                "input.KBM": "true",
                "player.input": "KBM",
                "player.option.microphoneEnabled": "false",
                "player.option.uiLanguage": "en"
            }
        )
        const response = await fetch(
            `https://epic-fortnite-proxy.neonite.net/fortnite/api/game/v2/matchmakingservice/ticket/player/${this.session.account_id}?${parms.toString()}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json', 
                }
            }
        );

        if (response.status != 200) {
            throw await parseError(response);
        }

        if (!isJSONresponse(response)) {
            throw new Error(`An error occurred while communicating with the game servers: Non JSON response from ${response.url}`);
        }

        return await response.json();
    }
}