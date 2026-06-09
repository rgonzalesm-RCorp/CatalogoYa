import iziToast from 'izitoast';

export const getErrorMessage = (error, fallback = 'Ocurrió un error inesperado.') => (
  error?.response?.data?.message
  || error?.message
  || fallback
);

export const showSuccessToast = (message) => {
  iziToast.success({
    title: 'Éxito',
    message,
    position: 'topRight',
    timeout: 3000,
  });
};

export const showErrorToast = (message) => {
  iziToast.error({
    title: 'Error',
    message,
    position: 'topRight',
    timeout: 4000,
  });
};

export const showInfoToast = (message) => {
  iziToast.info({
    title: 'Info',
    message,
    position: 'topRight',
    timeout: 3000,
  });
};
