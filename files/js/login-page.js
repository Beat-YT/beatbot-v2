/// <reference path="../../types.d.ts"/>
/// <reference path="../../sweetalert2.d.ts"/>


;
(
    async function () {
        const accountService = new AccountService();

        const s_token = getCookie('bearer-token');

        if (s_token) {
            const initState = await accountService.tryInit(s_token);

            if (initState) {
                return location.replace('/dashboard');
            } else {
                eraseCookie('bearer-token');
            }
        }
    }().catch((error) => {
        Swal.fire('Whoops, something went wromng', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);