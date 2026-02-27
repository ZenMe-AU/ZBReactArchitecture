/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link } from "react-router";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PortalBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function PortalBreadcrumbs({ items }: PortalBreadcrumbsProps) {
  return (
    <Breadcrumbs sx={{ mb: 3 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return (
            <Typography key={item.label} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          );
        }
        return (
          <MuiLink key={item.label} component={Link} to={item.href} underline="hover" color="primary" variant="body2">
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
