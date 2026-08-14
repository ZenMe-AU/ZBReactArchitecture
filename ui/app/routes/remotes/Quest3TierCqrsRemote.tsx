/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Suspense, lazy } from "react";

const Quest3TierCqrsRoutes = lazy(() => import("quest3TierCqrsRemote/AppRoutes"));

export default function Quest3TierCqrsRemote() {
  return (
    <Suspense fallback={<div>Loading quest3TierCqrs module...</div>}>
      <Quest3TierCqrsRoutes />
    </Suspense>
  );
}
