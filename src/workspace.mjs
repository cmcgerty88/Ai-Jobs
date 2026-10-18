import { STORAGE_KEY, restoreState, serialiseState } from './model.mjs';
import { VAULT_KEY, parseVault, newKey, seal, unseal } from './vault.mjs';
const $ = id => document.getElementById(id);
export function initWorkspace({ getState, setState, start, announce }) {
  let session = null, saved = null, expectedRaw = null, generation = 0, timer, active = false, pending = Promise.resolve(), backup = null, failed = false, legacyLoaded = false;
  let lastActivity = Date.now();
  function lockedUI() {
    let encrypted = false, legacy = false;
    try {
      expectedRaw = localStorage.getItem(VAULT_KEY);
      if (expectedRaw) {
        try {
          if (parseVault(expectedRaw).expiresAt <= Date.now()) {
            localStorage.removeItem(VAULT_KEY); expectedRaw = null;
            $('signup-error').textContent = 'The saved workspace expired after 30 days without a save and was deleted. You can start again.';
          }
        } catch { $('signup-error').textContent = 'The saved workspace cannot be read. Delete the saved copy to start again.'; }
      }
      encrypted = Boolean(expectedRaw); legacy = Boolean(localStorage.getItem(STORAGE_KEY));
    } catch { $('signup-error').textContent = 'Browser storage is unavailable. You can try without saving.'; }
    $('restore-panel').hidden = !encrypted && !legacy;
    $('restore-panel').querySelector('strong').textContent = legacy ? 'An older, unencrypted profile is stored in this browser.' : 'Your encrypted workspace is ready to unlock.';
    $('restore-panel').querySelector('p').textContent = legacy ? 'Load and encrypt it using a new passphrase, or delete the saved copy. The old copy remains readable in browser storage until you do.' : 'Enter your passphrase below. We cannot reset it. No raw CV was saved.';
    $('load-saved').hidden = !legacy || encrypted;
    $('signup-confirm-fields').hidden = encrypted;
    $('create-workspace').textContent = encrypted ? 'Unlock workspace' : 'Create private workspace';
    $('passphrase').autocomplete = encrypted ? 'current-password' : 'new-password';
    $('session-only').hidden = encrypted || legacy;
  }
  function enter() {
    active = true; lastActivity = Date.now();
    $('signup').hidden = true; $('restore-panel').hidden = true; $('backup-restore').hidden = true; $('workspace').hidden = false;
    $('signup-form').reset(); $('save-passphrase').value = ''; $('save-passphrase-confirm').value = '';
    start(); changed();
  }
  async function write(json) {
    if (!session) return;
    const token = generation, key = session;
    const raw = await seal(json, key);
    await navigator.locks.request('rolebridge-workspace-write', async () => {
      if (token !== generation || key !== session) return;
      if (localStorage.getItem(VAULT_KEY) !== expectedRaw) throw new Error('This workspace changed in another tab. Lock and reopen it before editing again.');
      localStorage.setItem(VAULT_KEY, raw); expectedRaw = raw; saved = json;
      // Migration commits encrypted data successfully before removing the legacy copy.
      localStorage.removeItem(STORAGE_KEY);
    });
  }
  function status(message) { $('save-heading').textContent = session ? 'Encrypted workspace on this device' : 'This session is not saved'; $('save-status').textContent = message; }
  function save() {
    clearTimeout(timer);
    const json = serialiseState(getState());
    if (!session || json === saved) return pending;
    pending = pending.catch(() => {}).then(async () => {
      if (!session) return;
      await write(json); failed = false;
      if (json === serialiseState(getState())) status('Saved encrypted. Raw CV excluded. Expires 30 days after the last save.');
    }).catch(error => { failed = true; status(error.message.includes('another tab') ? error.message : 'Saving failed. Keep this tab open, retry Save, or download an encrypted backup.'); throw error; });
    return pending;
  }
  function changed() {
    if (!active) return;
    if (!session) { status('Closing, refreshing or locking clears this session. Create a workspace to remember it.'); return; }
    if (serialiseState(getState()) === saved) { status('Saved encrypted. Raw CV excluded. Expires 30 days after the last save.'); return; }
    status('Saving encrypted…'); clearTimeout(timer); timer = setTimeout(() => { save().catch(() => {}); }, 250);
  }
  async function create(pass, confirm, consent) {
    if (!consent) throw new Error('Please confirm that you want encrypted saving on this device.');
    if (pass !== confirm) throw new Error('The passphrases do not match.');
    if (!crypto.subtle || !navigator.locks) throw new Error('Encrypted saving requires a current browser over HTTPS. Try without saving instead.');
    if (localStorage.getItem(STORAGE_KEY) && !legacyLoaded) throw new Error('Load the older profile first to keep your work, or delete the saved copy before starting again.');
    if (localStorage.getItem(VAULT_KEY)) throw new Error('An encrypted workspace already exists. Unlock it or delete the saved copy first.');
    const candidate = await newKey(pass);
    session = candidate; expectedRaw = null;
    try { await write(serialiseState(getState())); } catch (error) { session = null; throw error; }
  }
  $('signup-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('create-workspace'); button.disabled = true; $('signup-error').textContent = '';
    try {
      const raw = backup || localStorage.getItem(VAULT_KEY);
      if (raw) {
        const opened = await unseal(raw, $('passphrase').value);
        const restored = restoreState(opened.json);
        if (backup) {
          const previous = localStorage.getItem(VAULT_KEY), previousLegacy = localStorage.getItem(STORAGE_KEY);
          if ((previous || previousLegacy) && !confirm('Replace the existing saved workspace with this backup?')) return;
          await navigator.locks.request('rolebridge-workspace-write', () => {
            if (localStorage.getItem(VAULT_KEY) !== previous || localStorage.getItem(STORAGE_KEY) !== previousLegacy) throw new Error('Workspace changed in another tab.');
            localStorage.setItem(VAULT_KEY, raw); localStorage.removeItem(STORAGE_KEY);
          });
        }
        session = opened.session; expectedRaw = raw; setState(restored); saved = serialiseState(restored); backup = null;
      } else await create($('passphrase').value, $('passphrase-confirm').value, $('workspace-consent').checked);
      enter();
    } catch (error) { $('signup-error').textContent = backup || expectedRaw ? 'Unable to unlock: check your passphrase. The workspace may be damaged or expired.' : error.message; }
    finally { button.disabled = false; $('passphrase').value = ''; $('passphrase-confirm').value = ''; }
  });
  $('session-only').addEventListener('click', enter);
  $('load-saved').addEventListener('click', () => {
    try { setState(restoreState(localStorage.getItem(STORAGE_KEY))); legacyLoaded = true; enter(); $('save-open').click(); }
    catch { $('signup-error').textContent = 'The older profile cannot be read. Delete the saved copy to start again.'; }
  });
  $('save-open').addEventListener('click', () => {
    if (session) { save().then(() => announce('Encrypted workspace saved.')).catch(() => {}); return; }
    $('save-consent').checked = false; $('save-error').textContent = ''; $('save-dialog').showModal();
  });
  $('save-confirm').addEventListener('click', async () => {
    $('save-confirm').disabled = true;
    try { await create($('save-passphrase').value, $('save-passphrase-confirm').value, $('save-consent').checked); $('save-dialog').close(); changed(); }
    catch (error) { $('save-error').textContent = error.message; }
    finally { $('save-confirm').disabled = false; $('save-passphrase').value = ''; $('save-passphrase-confirm').value = ''; }
  });
  $('save-dialog').addEventListener('close', () => { $('save-passphrase').value = ''; $('save-passphrase-confirm').value = ''; });
  async function erase() {
    generation++; clearTimeout(timer); session = null;
    const remove = () => { localStorage.removeItem(VAULT_KEY); localStorage.removeItem(STORAGE_KEY); };
    if (navigator.locks) await navigator.locks.request('rolebridge-workspace-write', remove); else remove();
    location.reload();
  }
  $('delete-saved').addEventListener('click', async () => {
    if (!confirm('Delete the saved workspace from this browser? This cannot be undone.')) return;
    try { await erase(); } catch { $('signup-error').textContent = 'Deletion failed. Remove this site’s data using browser settings.'; }
  });
  $('clear-open').addEventListener('click', () => $('clear-dialog').showModal());
  $('clear-confirm').addEventListener('click', async () => {
    try { await erase(); } catch { $('clear-dialog').close(); status('Deletion failed. Lock the workspace and remove this site’s data using browser settings.'); }
  });
  async function lock(automatic = false) {
    if (session) {
      try { await save(); } catch {
        if (!automatic && !confirm('Saving failed. Lock anyway and discard unsaved changes?')) return;
        if (automatic) { generation++; session = null; location.reload(); return; }
      }
    } else if (!automatic && !confirm('This session was not saved. Locking will discard it. Continue?')) return;
    generation++; session = null; location.reload();
  }
  $('lock-workspace').addEventListener('click', () => lock());
  ['pointerdown', 'keydown', 'input'].forEach(type => document.addEventListener(type, () => {
    if (active && Date.now() - lastActivity >= 600000) { lock(true); return; }
    lastActivity = Date.now();
  }, { passive: true }));
  setInterval(() => { if (active && Date.now() - lastActivity >= 600000) lock(true); }, 10000);
  document.addEventListener('visibilitychange', () => { if (active && Date.now() - lastActivity >= 600000) lock(true); });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  window.addEventListener('storage', event => { if (active && (event.key === VAULT_KEY || event.key === STORAGE_KEY || event.key === null)) { generation++; session = null; location.reload(); } });
  window.addEventListener('beforeunload', event => {
    if (session && (failed || serialiseState(getState()) !== saved)) { event.preventDefault(); event.returnValue = ''; }
  });
  $('export-profile').addEventListener('click', async () => {
    if (!session) { $('save-open').click(); return; }
    try {
      const raw = await seal(serialiseState(getState()), session);
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'rolebridge-encrypted-backup.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Encrypted backup downloaded. Keep your passphrase separately. Delete unwanted backups yourself.');
    } catch { status('Backup could not be created. Your current inputs are still in this tab.'); }
  });
  $('backup-file').addEventListener('change', async () => {
    try {
      const file = $('backup-file').files[0]; if (!file) return;
      if (file.size > 1600000) throw new Error();
      const raw = await file.text(); if (parseVault(raw).expiresAt <= Date.now()) throw new Error();
      backup = raw; $('signup-confirm-fields').hidden = true; $('create-workspace').textContent = 'Unlock backup'; $('signup').hidden = false;
      $('backup-status').textContent = 'Backup read in this tab. Enter its passphrase to restore it. Nothing has been replaced yet.'; $('passphrase').focus();
    } catch { backup = null; lockedUI(); $('backup-status').textContent = 'This is not a supported, unexpired encrypted backup.'; }
    $('backup-file').value = '';
  });
  lockedUI();
  return { changed };
}
