import api from "./api";

let channel = null;

export const fetchNotifications = async (memberId, store) => {
  const response = await api.get("/notifications", {
    params: { memberId },
  });

  store.state.data.notifications = response.data;
};

export const startNotificationListener = (memberId, store) => {
  if (!window.Echo || channel) return;

  channel = window.Echo
    .private(`user.${memberId}`)
    .listen(".notification.sent", (e) => {
      if (e?.notification) {
        store.state.data.notifications.unshift(e.notification);
      }
    });
};

export const stopNotificationListener = (memberId) => {
  if (!window.Echo) return;

  window.Echo.leave(`private-user.${memberId}`);
  channel = null;
};
