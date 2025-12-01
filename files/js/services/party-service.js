class PartyService {
    /**
     * 
     * @param {Token} session 
     */
    constructor(session) {
        this.session = session;
        /**
         * @type {Party}
         */
        this.party = undefined;
    }

    /**
     * @param {string} partyId
     * @returns {Promise}
     */
    async queryParty(partyId) {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/parties/${partyId}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json'
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
     * @returns {Promise<UserParty>}
     */
    async queryUser() {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/user/${this.session.account_id}`,
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
    * @param {string} pingerId
    * @returns {Promise}
    */
    async queryPartyFromPing(from, to) {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/user/${to}/pings/${from}/parties`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json'
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
     * 
     * @param {string} pingerId 
     * @returns 
     */
    async joinPartyFromPing(pingerId, JabberId, plat) {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/user/${this.session.account_id}/pings/${pingerId}/join`,
            {
                method: 'POST',
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    Accept: 'application/json'
                },
                body: JSON.stringify(
                    {
                        "connection": {
                            "id": JabberId,
                            "meta": {
                                "urn:epic:conn:platform_s": plat,
                                "urn:epic:conn:type_s": "game"
                            },
                            "yield_leadership": false
                        },
                        "meta": {
                            "urn:epic:member:dn_s": this.session.displayName,
                            "urn:epic:member:joinrequestusers_j": JSON.stringify(
                                {
                                    "users": [
                                        {
                                            "id": this.session.account_id,
                                            "dn": this.session.displayName,
                                            "plat": plat,
                                            "data": JSON.stringify(
                                                {
                                                    "CrossplayPreference_i": "1",
                                                    "SubGame_u": "1"
                                                }
                                            )
                                        }
                                    ]
                                }
                            )
                        }
                    }
                )
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

    async leaveParty() {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/parties/${this.party.id}/members/${this.session.account_id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                },
            }
        );

        if (response.status != 204) {
            throw await parseError(response);
        }

        this.party = undefined;
    }

    /**
    * 
    * @param {string} partyId 
    * @returns 
    */
    async joinParty(partyId, JabberId, plat) {
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/parties/${partyId}/members/${this.session.account_id}/join`,
            {
                method: 'POST',
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    Accept: 'application/json'
                },
                body: JSON.stringify(
                    {
                        connection: {
                            id: JabberId,
                            meta: {
                                "urn:epic:conn:platform_s": plat,
                                "urn:epic:conn:type_s": "game"
                            },
                            yield_leadership: false
                        },
                        meta: {
                            "urn:epic:member:dn_s": this.session.displayName,
                            "urn:epic:member:joinrequestusers_j": JSON.stringify(
                                {
                                    users: [
                                        {
                                            id: this.session.account_id,
                                            dn: this.session.displayName,
                                            plat: plat,
                                            data: JSON.stringify(
                                                {
                                                    "CrossplayPreference_i": "1",
                                                    "SubGame_u": "1"
                                                }
                                            )
                                        }
                                    ]
                                }
                            )
                        }
                    }
                )
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
     * 
     * @param {string} pingerId 
     * @returns 
     */
    async updateMemberMeta(update, deleted) {
        for (const key in update) {
            if (typeof update[key] == 'object') {
                update[key] = JSON.stringify(update[key])
            }
        }

        const partyMemeber = this.party.members.find(x => x.account_id == this.session.account_id);
        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/parties/${this.party.id}/members/${this.session.account_id}/meta`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    Accept: 'application/json'
                },
                body: JSON.stringify(
                    {
                        revision: partyMemeber.revision,
                        update: update,
                        delete: deleted
                    }
                )
            }
        );

        if (response.status != 204) {
            const error = await parseError(response);

            if (error.numericErrorCode == 51018 && error.messageVars?.[1]) {
                var correctRevision = parseInt(error.messageVars[1]);
                if (!isNaN(correctRevision)) {
                    partyMemeber.revision = correctRevision;
                    return this.updateMemberMeta.apply(this, arguments);
                }
            } else {
                throw error;
            }

            throw error;
        }

        partyMemeber.revision++;
    }

    async promote(memberId) {
        if (!this.party) {
            throw new Error('Not in a party');
        }

        const response = await fetch(
            `${PROXY_URL}/party/api/v1/Fortnite/parties/${this.party.id}/members/${memberId}/promote`,
            {
                method: 'POST',
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`
                }
            }
        );

        if (response.status != 204) {
            throw await parseError(response);
        }
    }
}