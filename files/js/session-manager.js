/// <reference path="./services/account-service.js" />

const CREDENTIALS = {
    clientId: '98f7e42c2e3a4f86a74eb43fbb41ed39',
    secret: '0a2449a2-001a-451e-afec-3e812901c4d7',
}

async function getClientSession() {
    const accountService = new AccountService();

    const storedSessionS = localStorage.getItem('client_session');
    if (storedSessionS) {
        const storedSession = JSON.parse(storedSessionS);
        accountService.session = storedSession;

        try {
            await accountService.verify();
            return accountService;
        } catch (error) {
            if (error instanceof ApiError && error.numericErrorCode == 1014) {
                localStorage.removeItem('client_session');
            } else {
                throw error;
            }
        }
    }

    const session = await accountService.getAccessToken(
        CREDENTIALS.clientId,
        CREDENTIALS.secret,
        'client_credentials'
    );

    localStorage.setItem('client_session', JSON.stringify(session));
    return accountService;
}

async function getUserSession() {
    const accountService = new AccountService();

    const storedSessionS = localStorage.getItem('account_session_j');
    if (storedSessionS) {
        const storedSession = JSON.parse(storedSessionS);
        accountService.session = storedSession;

        const isExpired = true; //new Date(storedSession.expires_at).getTime() - 6000000 <= Date.now();
        const isRefreshExpired = new Date(storedSession.refresh_expires_at).getTime() <= Date.now();

        if (isExpired && !isRefreshExpired) {
            const refreshed = await accountService.refresh(storedSession.refresh_token);
            if (!refreshed) {
                localStorage.removeItem('account_session_j');
                return;
            }

            localStorage.setItem('account_session_j', JSON.stringify(accountService.session));
            return accountService;
        } else if (!isExpired) {
            const isVerified = await accountService.verify();
            if (!isVerified) {
                localStorage.removeItem('account_session_j');
                return;
            }

            return accountService;
        }
    }
}