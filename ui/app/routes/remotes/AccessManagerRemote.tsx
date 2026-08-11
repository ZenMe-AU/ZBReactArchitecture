/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Suspense, lazy } from "react";

const AccessManagerRoutes = lazy(() => import("accessManagerRemote/AppRoutes"));

export default function AccessManagerRemote() {
  return (
    <Suspense fallback={<div>Loading accessManager module...</div>}>
      <AccessManagerRoutes />
    </Suspense>
  );
}
