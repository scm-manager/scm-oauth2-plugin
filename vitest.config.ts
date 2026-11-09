/*
 * Copyright (c) 2026 - present Thorsten Ludewig (t.ludewig@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    reporters: ["default", "junit"],
    outputFile: { junit: "build/vite-reports/TEST-frontend.xml" },
    coverage: {
      enabled: !!process.env.CI || !!(process.env.JENKINS_URL && process.env.BUILD_ID),
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "build/vite-reports/coverage",
      include: ["src/main/js/**/*.{ts,tsx}"],
      exclude: ["src/main/js/**/*.test.{ts,tsx}"],
    },
  },
});
