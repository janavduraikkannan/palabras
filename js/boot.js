/* SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 janavduraikkannan and Linguae contributors */
/* ---------- Start-up: runs after every other script has loaded ---------- */
buildUses();
hud();acctUI();route();pullNow().then(()=>pushBoard());
buildCharts();
buildStart();
setupKeys();
setupOnboarding();
lessonsSetup();
testsSetup();
