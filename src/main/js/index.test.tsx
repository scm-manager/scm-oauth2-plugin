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

import { beforeEach, describe, expect, it, vi } from "vitest";

const { bind, bindAdminSetting } = vi.hoisted(() => ({ bind: vi.fn(), bindAdminSetting: vi.fn() }));

vi.mock("@scm-manager/ui-extensions", () => ({ binder: { bind } }));
vi.mock("@scm-manager/ui-components", () => ({ ConfigurationBinder: { bindAdminSetting } }));
vi.mock("./GlobalOAuth2Configuration", () => ({ default: () => null }));
vi.mock("./OAuth2LoginForm", () => ({ default: () => null }));
vi.mock("./OAuth2LoginLink", () => ({ default: () => null }));

describe("OAuth2 extensions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    await import("./index");
  });

  it("registers the administration settings using the SCM-Manager 4 binder", () => {
    expect(bindAdminSetting).toHaveBeenCalledWith(
      "/oauth2",
      "scm-oauth2-plugin.nav-link",
      "oauth2Config",
      expect.any(Function),
    );
  });

  it("offers navigation login only when the backend advertises OAuth2", () => {
    const registration = bind.mock.calls.find(([name]) => name === "primary-navigation.login")!;
    const predicate = registration[2];
    expect(predicate({ links: { oauth2Login: { href: "/oauth2/login" } } })).toBe(true);
    expect(predicate({ links: {} })).toBe(false);
    expect(bind).toHaveBeenCalledWith("login.form", expect.any(Function));
  });
});
