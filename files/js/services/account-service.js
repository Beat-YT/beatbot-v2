/// <reference path="../../../types.d.ts" />

class AccountService {
    /**
    * 
    * @param {Token} session 
    */
    constructor(session) {
        if (session) {
            const expiration = new Date(session.expires_at);

            if (expiration.getTime() - 600000 >= Date.now()) {
                this.session = session;
            }
        }
    }

    /**
     * 
     * @param {string} refresh_token 
     */
    async refresh(refresh_token) {
        try {
            const token = await this.getAccessToken(
                '98f7e42c2e3a4f86a74eb43fbb41ed39',
                '0a2449a2-001a-451e-afec-3e812901c4d7',
                'refresh_token',
                { refresh_token: refresh_token }
            );

            this.session = token;
            return true;
        } catch (error) {
            if (error instanceof ApiError && error.numericErrorCode == 18036) {
                return false;
            }
            
            throw error;
        }
    }


    /**
     * 
     * @returns {Promise<VerifyToken>}
     */
    async verify() {
        const response = await fetch(
            `${PROXY_URL}/account/api/oauth/verify`,
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
     * @returns {Promise<Token>}
     */
    async getAccessToken(clientId, secrect, grantType, fields) {
        const response = await fetch(
            `${PROXY_URL}/account/api/oauth/token`,
            {
                body: new URLSearchParams(
                    {
                        ...fields,
                        grant_type: grantType,
                        token_type: 'eg1'
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

        const token = await response.json();
        this.session = token;
        return token;
    }

    /**
     * 
     * @param {"OTHERS" | "ALL_ACCOUNT_CLIENT" | "OTHERS_ACCOUNT_CLIENT" | "OTHERS_ACCOUNT_CLIENT_SERVICE"} killType 
     */
    async killSessions(killType) {
        const response = await fetch(
            `${PROXY_URL}/account/api/oauth/sessions/kill?killType=${killType}`,
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
            `${PROXY_URL}/account/api/oauth/sessions/kill/${accessToken ?? this.session.access_token}`,
            {
                headers: {
                    Authorization: `${this.session.token_type ?? 'bearer'} ${accessToken ?? this.session.access_token}`
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
            `${PROXY_URL}/account/api/oauth/deviceAuthorization`,
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
            `${PROXY_URL}/account/api/oauth/deviceAuthorization/${userCode}`,
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
            accountIds.map(x => ['accountId', x])
        );

        const response = await fetch(
            `${PROXY_URL}/account/api/public/account?${searchParams}`,
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
            `${PROXY_URL}/account/api/public/account/${accountId}`,
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