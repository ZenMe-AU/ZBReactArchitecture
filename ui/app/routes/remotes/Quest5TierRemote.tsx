/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Suspense, lazy } from "react";

const Quest5TierRoutes = lazy(() => import("quest5TierRemote/AppRoutes"));

export default function Quest5TierRemoteRoute() {
  return (
    <Suspense fallback={<div>Loading quest5Tier module...</div>}>
      <Quest5TierRoutes />
    </Suspense>
  );
}
