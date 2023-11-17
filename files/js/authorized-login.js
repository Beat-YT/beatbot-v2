/// <reference path="../../types.d.ts"/>


;
(
    async function () {
       
    }().catch((error) => {
        Swal.fire('Whoops, something went wromng', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);