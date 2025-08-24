export function getAccounts() {
  return JSON.parse(localStorage.getItem("accounts") || "[]");
}

export function saveAccounts(accounts) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}