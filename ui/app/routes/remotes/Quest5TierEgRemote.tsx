/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Suspense, lazy } from "react";

const Quest5TierEgRoutes = lazy(() => import("quest5TierEgRemote/AppRoutes"));

export default function Quest5TierEgRemoteRoute() {
  return (
    <Suspense fallback={<div>Loading quest5TierEg module...</div>}>
      <Quest5TierEgRoutes />
    </Suspense>
  );
}
