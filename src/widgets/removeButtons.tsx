import { ReactRNPlugin } from '@remnote/plugin-sdk';
import { lockedNotes } from '.';

export async function removeButtons(plugin: ReactRNPlugin) {
  if (lockedNotes.length == 0) {
    return;
  }
  const url = await plugin.window.getURL();
  if (url.startsWith('/groups') || url.startsWith('/community') || url.startsWith('/profile')) {
    await plugin.app.toast("Hey! You can't go here because you are viewing locked notes. :)");
    await plugin.window.setURL('/notes');
    await plugin.app.toast("Hey! You can't go here because you are viewing locked notes. :)");
    return;
  }
  const buttons = document.querySelectorAll('button');
  buttons.forEach(function (button) {
    if (button.textContent.includes('Reshare')) {
      button.remove();
    }
  });
  const sharePopoverTrigger = document.querySelector('[data-cy="share-popover-trigger"]');
  if (sharePopoverTrigger) {
    sharePopoverTrigger.remove();
  }
  const exportButton = document.querySelector('[data-cy="Export"]');
  if (exportButton) {
    exportButton.remove();
  }
  const exportButtonDropdown = document.querySelector('[data-cy-label="Export"]');
  if (exportButtonDropdown) {
    exportButtonDropdown.remove();
  }
  const communityLink = document.querySelector('[data-label="Community"]');
  if (communityLink) {
    communityLink.remove();
  }
  const communityLinkDropdown = document.querySelector('[data-cy-label="Community"]');
  if (communityLinkDropdown) {
    communityLinkDropdown.remove();
  }
  const exportButtonVersion2ElectricBoogaloo = document.querySelector(
    '[data-command-name="Export"]'
  );
  if (exportButtonVersion2ElectricBoogaloo) {
    exportButtonVersion2ElectricBoogaloo.remove();
  }
}
