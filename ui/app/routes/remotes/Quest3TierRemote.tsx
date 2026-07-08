/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Suspense, lazy } from "react";

const Quest3TierRoutes = lazy(() => import("quest3TierRemote/AppRoutes"));

export default function Quest3TierRemoteRoute() {
  return (
    <Suspense fallback={<div>Loading quest3Tier module...</div>}>
      <Quest3TierRoutes />
    </Suspense>
  );
}
