chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await generateInstallationId()

  if (reason === 'install' || reason === 'upgrade') {
    await triggerStat(reason)
  }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.stat) {
      triggerStat(request.stat)
    }
    sendResponse({});
  }
);

function getRandomToken() {
  return crypto.randomUUID();
}

async function generateInstallationId() {
  const existingId = await getInstallationId();

  if (existingId) {
    return
  }

  const id = getRandomToken()

  await chrome.storage.local.set({
    installation_id: id,
    installation_date: (new Date().toISOString())
  })

  return id;
}

async function getInstallationId() {
  return (await chrome.storage.local.get(['installation_id'])).installation_id
}

async function triggerStat(eventName) {
  console.log(`Received Event: ${eventName}`)

  let eventQueue = (await chrome.storage.local.get('event_queue')).event_queue;

  const saveQueue = (data) => chrome.storage.local.set({ event_queue: JSON.stringify(data) })

  if (eventQueue) {
    eventQueue = JSON.parse(eventQueue)
  } else {
    eventQueue = [];
  }

  if (eventQueue.length > 500) {
    console.error('There was an error processing events on the event queue (perhaps the server is down?)');
    console.error('To prevent the event queue from getting too large, the queue is cleared and the data is lost');

    await saveQueue([])

    return;
  }

  eventQueue.push({
    event_name: eventName,
    event_date: (new Date().toISOString()),
    installation_id: await getInstallationId(),
  })

  await saveQueue(eventQueue)

  if ((eventQueue.length > 50 && Math.random() < 0.8) || (Math.random() < 0.25)) {
    try {
      await sendEventQueue(eventQueue)

      await saveQueue([])
    } catch (e) {
      console.error('There was an error sending the event queue. It will be retried on next event.')
    }
  }
}

async function sendEventQueue(events) {
  await fetch(`https://videomirror.app/api/events`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      events: events,
    })
  })
}
