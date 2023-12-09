/// <reference path="../../types.d.ts"/>

var _loginAction = undefined;
;
(
    async function () {
        const loginBtn = document.getElementById('loginBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');


        const session_j = localStorage.getItem('account_session_j');
        const session = session_j && JSON.parse(session_j) ;

        if (session) {
            loginBtn.style.display = 'none';
            const accountService = new AccountService();
            const refreshed = await accountService.refresh(session.refresh_token);

            if (!refreshed) {
                localStorage.removeItem('account_session_j');
                dashboardBtn.style.display = 'none';
                loginBtn.style.display = 'inline';
            }
        } else {
            dashboardBtn.style.display = 'none';
        }        
    }().catch((error) => {
        Swal.fire('Whoops, something went wromng', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);