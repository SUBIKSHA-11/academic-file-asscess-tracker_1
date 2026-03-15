export const getApiErrorMessage = async (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      const parsed = JSON.parse(text);
      if (parsed?.message) {
        return parsed.message;
      }
    } catch {
      return fallbackMessage;
    }
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
};
