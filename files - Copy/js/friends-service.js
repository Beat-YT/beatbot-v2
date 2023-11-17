class FriendsService {
    /**
     * 
     * @param {Token} session 
     */
    constructor(session) {
        this.session = session;
    }

    /**
     * @returns {Promise<FriendSummary>}
     */
    async queryFriendsSummary() {
        const response = await fetch(
            `https://epic-friends-proxy.beatbot.xyz/friends/api/v1/${this.session.account_id}/summary`,
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


    /**
     * @returns {Promise<FriendIncoming[]>}
     */
    async queryIncomingFriendRequests() {
        const response = await fetch(
            `https://epic-friends-proxy.beatbot.xyz/friends/api/v1/${this.session.account_id}/incoming`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json',
                },
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

    /**
     * @param {string} friendId target account id
     * @returns {Promise<void>}
     */
    async sendInviteOrAcceptInvite(friendId) {
        const response = await fetch(
            `https://epic-friends-proxy.beatbot.xyz/friends/api/v1/${this.session.account_id}/friends/${friendId}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`
                },
                method: 'POST'
            }
        );

        if (response.status != 204) {
            throw await parseError(response);
        }
    }

    /**
    * @param {string} friendId target account id
    * @returns {Promise<void>}
    */
    async deleteFriendOrRejectInvite(friendId) {
        const response = await fetch(
            `https://epic-friends-proxy.beatbot.xyz/friends/api/v1/${this.session.account_id}/friends/${friendId}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`
                },
                method: 'DELETE'
            }
        );

        if (response.status != 204) {
            throw await parseError(response);
        }
    }
}