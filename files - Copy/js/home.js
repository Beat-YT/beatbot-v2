/// <reference path="../../types.d.ts"/>


;
(
    async function () {
        const loginBtn = document.getElementById('loginBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');

        const accountService = new AccountService();

        const s_token = getCookie('bearer-token');
        if (s_token) {
            const initState = await accountService.tryInit(s_token)
            if (initState) {
                loginBtn.style.display = 'none';
            } else {
                dashboardBtn.style.display = 'none';
                loginBtn.onclick = loginAction;
                eraseCookie('bearer-token')
            }
        } else {
            dashboardBtn.style.display = 'none';
            loginBtn.onclick = loginAction;
        }

        const clientAccountService = new AccountService();

        clientAccountService.session = await clientAccountService.getAccessToken(
            '98f7e42c2e3a4f86a74eb43fbb41ed39',
            '0a2449a2-001a-451e-afec-3e812901c4d7',
            'client_credentials'
        );

        async function loginAction() {
            const deviceCode = await clientAccountService.initiatePinAuth('login');
            const logoutUrl = `https://www.epicgames.com/id/logout?redirectUrl=https://www.epicgames.com/id/oauth-authorized/success`

            const verification_uri_complete = new URL(deviceCode.verification_uri_complete);

            verification_uri_complete.searchParams.set('redirectUrl', logoutUrl);

            const final = `https://www.epicgames.com/id/logout?redirectUrl=${verification_uri_complete}`;

            let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=550,height=850,left=100,top=100`;

            const newWindow = open(final, 'EpicLogin', params);

            var interval = setInterval(async () => {
                try {
                    if (newWindow.closed) {
                        clearInterval(interval);
                        try {
                            var token = await clientAccountService.getAccessToken(
                                '98f7e42c2e3a4f86a74eb43fbb41ed39',
                                '0a2449a2-001a-451e-afec-3e812901c4d7',
                                'device_code',
                                { device_code: deviceCode.device_code }
                            );
                        } catch (error) {
                            if (error instanceof ApiError && error.numericErrorCode == 1012) {
                                clientAccountService.cancelPinAuth(deviceCode.user_code);
                                return;
                            }

                            throw error;
                        }

                        setCookie('bearer-token', token.access_token);
                        await clientAccountService.killSession(clientAccountService.session.access_token);
                        location.replace('/dashboard');
                    }
                } catch (error) {
                    Swal.fire('Whoops, something went wrong', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
                }
            }, 500)
        }

    }().catch((error) => {
        Swal.fire('Whoops, something went wromng', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);