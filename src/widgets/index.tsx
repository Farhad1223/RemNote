import { declareIndexPlugin, ReactRNPlugin, Rem, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { removeButtons } from './removeButtons';

let pluginPassthrough: ReactRNPlugin;

async function onActivate(plugin: ReactRNPlugin) {
  // Register settings

  setTimeout(() => {
    setInterval(async () => {
      await removeButtons(plugin);
    }, 25);
    setInterval(async () => {
      await detectLockedNotes();
    }, 1000);
    setInterval(async () => {
      await watchForLockedNotes();
    }, 500);
    setInterval(async () => {
      await watchForOtherDevicesActive();
    }, 1000);
  }, 25);

  pluginPassthrough = plugin;
}

export let lockedNotes: Rem[] = [];

async function detectLockedNotes() {
  const foundRem = await pluginPassthrough.search.search(['Rem:Locked:DoNotDeleteThis']);
  // store these rem in sessionStorage so we can keep an eye on them later
  lockedNotes = foundRem;
}

async function watchForLockedNotes() {
  // get the locked notes (the rem that just say Rem:Locked:DoNotDeleteThis) from sessionStorage, and check if they have been deleted.
  // if they have been deleted, WE need to go to the parent of that rem and delete the rem so that they don't have access to the purchased notes after maliciously deleting the locked-note tag.
  for (const lockedNote of lockedNotes) {
    try {
      await pluginPassthrough.rem.findOne(lockedNote._id);
    } catch (error) {
      const parent = await pluginPassthrough.rem.findOne(lockedNote.parent!);
      await parent!.remove();
    }
  }

  // iterate through the lockedNotes, go to their parents, attempt to access them, and if fails, delete the parent.
  for (const lockedNote of lockedNotes) {
    const lockedNoteTag = await pluginPassthrough.rem.findOne(lockedNote._id);

    const k = await pluginPassthrough.rem.findOne(lockedNote._id);

    if (k == undefined) {
      const parent = await pluginPassthrough.rem.findOne(lockedNote.parent!);
      await parent!.remove();
    }
  }
}

async function watchForOtherDevicesActive() {
  // This plugin prohibits use of multiple devices at the same time. RemNote has no way to track this, so we will build our own system.
  // We will use synced storage to keep track of the number of active devices. When the plugin is activated, it will send a request to the synced storage to increment the number of active devices.
  // If the number of active devices is more than 1, the plugin will disable itself or show an error message to the user.
  //  "numberOfDevices": 1
  //  "lastUpdated": "2021-09-25T20:00:00.000Z"
  // If the plugin sees that the lastUpdated is more than 10 seconds ago, it will subtract the numberOfDevices by -1.

  // We will use synced storage instead of a server as we don't have access to a server. Synced storage persists across devices and is secure.

  // console.info('running');

  const syncedStorage = await pluginPassthrough.storage.getSynced('numberOfDevices');
  const lastUpdated = await pluginPassthrough.storage.getSynced('lastUpdated');

  // console.log(syncedStorage);
  // console.log(lastUpdated);

  const now = new Date().toISOString();

  if (lastUpdated == undefined) {
    await pluginPassthrough.storage.setSynced('lastUpdated', now);
  }

  if (syncedStorage == undefined) {
    await pluginPassthrough.storage.setSynced('numberOfDevices', 1);
  } else {
    const numberOfDevices = syncedStorage as number;

    if (numberOfDevices > 1) {
      await pluginPassthrough.app.toast(
        "Hey! You can't go here because you are viewing locked notes. :)"
      );
      await pluginPassthrough.window.setURL('/notes');
      await pluginPassthrough.storage.setSynced('numberOfDevices', 0)
    }
  }
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
