export function getCurrentUsername() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const userObj = JSON.parse(userStr);
    return userObj?.username || null;
  } catch (e) {
    console.error("Error getting current username:", e);
    return null;
  }
}