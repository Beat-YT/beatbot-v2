/// <reference path="../../../types.d.ts"/>
/// <reference path="../../../sweetalert2.d.ts"/>


;
(
    async function () {
        const session_j = localStorage.getItem('account_session_j');
        const session = session_j && JSON.parse(session_j);

        if (session) {
            const accountService = new AccountService(session);

            try {
                await accountService.verify()
                return location.replace('/dashboard');
            } catch {
                localStorage.removeItem('account_session_j')
            }
        }
    }().catch((error) => {
        Swal.fire('Whoops, something went wrong', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);