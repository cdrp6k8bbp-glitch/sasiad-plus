self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data;

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Sąsiad+",
      body: event.data.text(),
      url: "/powiadomienia",
    };
  }

  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : "Sąsiad+";
  const body = typeof data.body === "string" ? data.body : "";
  const url =
    typeof data.url === "string" && data.url.startsWith("/")
      ? data.url
      : "/powiadomienia";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url },
      tag: typeof data.tag === "string" ? data.tag : undefined,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const path =
    typeof event.notification.data?.url === "string" &&
    event.notification.data.url.startsWith("/")
      ? event.notification.data.url
      : "/powiadomienia";
  const targetUrl = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const matchingClient = windowClients.find(
          (client) => client.url === targetUrl,
        );

        if (matchingClient) {
          return matchingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
