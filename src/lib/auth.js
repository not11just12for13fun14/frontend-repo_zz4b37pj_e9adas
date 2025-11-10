export function getAuth() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.token) return null;
    return data;
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  if (!auth) {
    localStorage.removeItem("auth");
    return;
  }
  localStorage.setItem("auth", JSON.stringify(auth));
}

export function logout() {
  localStorage.removeItem("auth");
}
