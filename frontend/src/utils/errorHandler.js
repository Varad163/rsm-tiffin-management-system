export const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'Something went wrong. Please try again.';
  }

  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(', ');
  }

  return data.error || data.message || 'Something went wrong. Please try again.';
};

export const getFieldErrors = (error) => {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === 'object') {
    return data.errors;
  }

  return {};
};
