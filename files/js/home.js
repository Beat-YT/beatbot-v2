/// <reference path="../../types.d.ts"/>

var _loginAction = undefined;
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
                eraseCookie('bearer-token')
            }
        } else {
            dashboardBtn.style.display = 'none';
        }

    }().catch((error) => {
        Swal.fire('Whoops, something went wromng', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);