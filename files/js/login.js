/// <reference path="../../types.d.ts"/>
/// <reference path="../../sweetalert2.d.ts"/>


;
(
    async function () {
        const accountService = await getClientSession();


        async function loginAction() {
            const deviceCode = await accountService.initiatePinAuth('login');
            const logoutUrl = `https://www.epicgames.com/id/oauth-authorized/success`
            const final = `https://www.epicgames.com/id/login?user_code=${deviceCode.user_code}&client_id=98f7e42c2e3a4f86a74eb43fbb41ed39&prompt=login`;

            let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=850,left=100,top=100`;

            var newWindow = open(final, 'EpicLogin', params);

            if (newWindow == null) {
                await Swal.fire(
                    {
                        title: "Login",
                        text: 'Please login in the new window',
                        footer: 'Test',
                        html: `<div><a style="color: black;">Your login code is ${deviceCode.user_code}</a><br><a id="safari-login-link" href="#" target="EpicLogin">Click here to login</a></div>`,
                        showConfirmButton: false,
                        showCancelButton: true,
                        didOpen: (popup) => {
                            var loginTag = document.getElementById("safari-login-link");
                            loginTag.onclick = function () {
                                newWindow = open(final, 'EpicLogin', params);
                                Swal.close();
                                return false;
                            }
                        }
                    }
                )
            }

            let intervalCounter = 0;
            let interval = setInterval(async () => {
                intervalCounter++;

                try {
                    if (!newWindow || !newWindow.closed) return;
                    clearInterval(interval);

                    try {
                        var token = await accountService.getAccessToken(
                            '98f7e42c2e3a4f86a74eb43fbb41ed39',
                            '0a2449a2-001a-451e-afec-3e812901c4d7',
                            'device_code',
                            { device_code: deviceCode.device_code }
                        )
                    } catch (error) {
                        if (error instanceof ApiError && error.numericErrorCode == 1012) {
                            accountService.cancelPinAuth(deviceCode.user_code);
                            return;
                        }

                        throw error;
                    }

                    localStorage.setItem('account_session_j', JSON.stringify(token));
                    location.replace('dashboard');
                } catch (error) {
                    Swal.fire('Whoops, something went wrong', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
                }
            }, 750)
        }

        document.getElementById('loginBtn').onclick = loginAction;
    }().catch((error) => {
        Swal.fire('Whoops, something went wrong', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);