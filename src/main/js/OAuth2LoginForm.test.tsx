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

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useIndexLinks, useLogin } from "@scm-manager/ui-api";
import OAuth2LoginForm from "./OAuth2LoginForm";

vi.mock("@scm-manager/ui-api", () => ({ useIndexLinks: vi.fn(), useLogin: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => [(key: string) => key] }));
vi.mock("@scm-manager/ui-core", () => ({
  Field: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Input: ({ testId, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { testId?: string }) => (
    <input data-testid={testId} {...props} />
  ),
  Button: ({
    children,
    isLoading,
    variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
    variant?: string;
  }) => (
    <button aria-busy={isLoading} {...props}>
      {children}
    </button>
  ),
  ErrorNotification: ({ error }: { error?: Error }) => (error ? <div role="alert">{error.message}</div> : null),
}));

const login = vi.fn();

const renderForm = (entry: string | { pathname: string; state: { from: string } } = "/login?from=%2Frepos") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<OAuth2LoginForm />} />
        <Route path="/repos" element={<div>Repositories</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("OAuth2 login form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useIndexLinks).mockReturnValue({
      login: { href: "/api/auth/login" },
      oauth2Login: { href: "/api/oauth2/login", name: "Example IdP" },
    });
    vi.mocked(useLogin).mockReturnValue({ login, isPending: false, isSuccess: false, error: null });
  });

  afterEach(cleanup);

  it("preserves the destination when starting OAuth2 login", () => {
    renderForm();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/api/oauth2/login?from=%2Frepos");
  });

  it("submits local credentials to the advertised login endpoint and redirects after success", async () => {
    renderForm();
    const submit = screen.getByRole("button");
    expect(submit.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByTestId("username-input"), { target: { value: "scmadmin" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "secret" } });
    fireEvent.click(submit);
    expect(login).toHaveBeenCalledWith("scmadmin", "secret");
    expect(useLogin).toHaveBeenLastCalledWith("/api/auth/login", expect.any(Function));
    const onSuccess = vi.mocked(useLogin).mock.lastCall![1];
    onSuccess();
    await waitFor(() => expect(screen.getByText("Repositories")).toBeTruthy());
  });

  it("uses the destination in router state and defaults to the home page", () => {
    renderForm({ pathname: "/login", state: { from: "/repos" } });
    expect(screen.getByRole("link").getAttribute("href")).toContain("from=%2Frepos");
    cleanup();
    renderForm("/login");
    expect(screen.getByRole("link").getAttribute("href")).toContain("from=%2F");
  });

  it("disables local login while authentication is pending and displays failures", () => {
    vi.mocked(useLogin).mockReturnValue({
      login,
      isPending: true,
      isSuccess: false,
      error: new Error("Invalid credentials"),
    });
    renderForm();
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("username-input").hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("password-input").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("alert").textContent).toBe("Invalid credentials");
  });

  it("keeps local login available when no OAuth2 link is advertised", () => {
    vi.mocked(useIndexLinks).mockReturnValue({ login: { href: "/api/auth/login" } });
    renderForm();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByTestId("username-input")).toBeTruthy();
  });
});
