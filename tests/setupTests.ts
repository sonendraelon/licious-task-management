import "@testing-library/jest-dom";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "";
});
