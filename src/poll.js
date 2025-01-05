async function subscribe() {
  try {
    const res = await fetch("http://localhost:8080/poll");
    if (res.status === 200) {
      location.reload();
    }
  } catch (e) {
    console.error(e);
  }
}
subscribe();
