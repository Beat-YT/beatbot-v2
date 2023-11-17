

class AccountService {
    /**
    * 
    * @param {Token} session 
    */
    constructor(session) {
        this.session = session;
    }

    async Init(token) {
        this.session = { access_token: token };
        const verifyData = await this.verify();
        this.session = mapVerifyToken(verifyData);
    }

    async tryInit(token) {
        try {
            this.session = { access_token: token };
            const verifyData = await this.verify();
            this.session = mapVerifyToken(verifyData);
            return true;
        } catch (error) {
            this.session = null;
            if (error instanceof ApiError && error.numericErrorCode == 1014) {
                return null;
            }
            throw error;
        }
    }

    /**
     * 
     * @param {boolean} includePerms 
     * @returns {Promise<VerifyToken>}
     */
    async verify(includePerms = false) {
        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/oauth/verify?includePerms=${includePerms}`,
            {
                headers: {
                    Authorization: `${this.session.token_type || 'bearer'} ${this.session.access_token}`,
                    Accept: 'application/json',
                }
            }
        );

        if (response.status != 200) {
            throw await parseError(response);
        }

        return await response.json();
    }

    /**
     * 
     * @param {string} clientId 
     * @param {string} secrect 
     * @param {string} grantType 
     * @param {Record<string,string>} fields 
     * @param {boolean} includePerms 
     * @returns {Promise<Token>}
     */
    async getAccessToken(clientId, secrect, grantType, fields, includePerms = false) {
        const response = await fetch(
            'https://epic-account-proxy.beatbot.xyz/account/api/oauth/token',
            {
                body: new URLSearchParams(
                    {
                        ...fields,
                        grant_type: grantType,
                        includePerms: includePerms
                    }
                ),
                headers: {
                    Authorization: `Basic ${btoa(`${clientId}:${secrect}`)}`,
                    Accept: 'application/json',
                },
                method: 'POST'
            }
        )

        if (response.status != 200) {
            throw await parseError(response);
        }

        return await response.json();
    }

    /**
     * 
     * @param {"OTHERS" | "ALL_ACCOUNT_CLIENT" | "OTHERS_ACCOUNT_CLIENT" | "OTHERS_ACCOUNT_CLIENT_SERVICE"} killType 
     */
    async killSessions(killType) {
        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/oauth/sessions/kill?killType=${killType}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json',
                },
                method: 'DELETE'
            }
        )

        if (response.status != 204) {
            throw await parseError(response);
        }
    }

    /**
     * 
     * @param {string} accessToken 
     */
    async killSession(accessToken) {
        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/oauth/sessions/kill/${accessToken}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json',
                },
                method: 'DELETE'
            }
        )

        if (response.status != 204) {
            throw await parseError(response);
        }
    }

    /**
     * @param {string} promt
     * @returns {Promise<DeviceCode>} a new device code
     */
    async initiatePinAuth(promt) {
        const response = await fetch(
            'https://epic-account-proxy.beatbot.xyz/account/api/oauth/deviceAuthorization',
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json',
                },
                method: 'POST',
                body: new URLSearchParams(
                    {
                        promt: promt
                    }
                )
            }
        );

        if (response.status != 200) {
            throw await parseError(response);
        }

        return await response.json();
    }

    /**
     * @param {string} userCode
     */
    async cancelPinAuth(userCode) {
        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/oauth/deviceAuthorization/${userCode}`,
            {
                headers: {
                    Authorization: `${this.session.token_type} ${this.session.access_token}`,
                    Accept: 'application/json',
                },
                method: 'DELETE'
            }
        );

        if (response.status != 204) {
            throw await parseError(response);
        }
    }

    async findAccountsByIds(...accountIds) {
        const searchParams = new URLSearchParams(
            accountIds.map(x => ['accountId',x])
        );

        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/public/account?${searchParams}`,
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

        return await response.json();
    }

    /**
     * 
     * @param {string} accountId 
     * @returns {Promise<Account>}
     */
    async getById(accountId) {
        const response = await fetch(
            `https://epic-account-proxy.beatbot.xyz/account/api/public/account/${accountId}`,
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

        return await response.json();
    }
}