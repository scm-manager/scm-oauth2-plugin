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

import React, { FC, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "@scm-manager/ui-types";
import { useIndexLinks, useLogin } from "@scm-manager/ui-api";
import { Button, ErrorNotification, Field, Input } from "@scm-manager/ui-core";

/**
 * Replaces the login form ("login.form" extension point). Renders a
 * "login with oauth2" button and, below it, the conventional
 * username/password form.
 */
const OAuth2LoginForm: FC = () => {
  const [t] = useTranslation("plugins");
  const links = useIndexLinks();
  const location = useLocation();
  const navigate = useNavigate();
  const from = new URLSearchParams(location.search).get("from") || location.state?.from || "/";
  const { login, isPending, error } = useLogin((links?.login as Link)?.href, () => {
    navigate(from);
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const oauth2LoginLink = links?.oauth2Login as Link;
  const oauth2Login = oauth2LoginLink?.href;
  const providerName = oauth2LoginLink?.name || "OAuth2";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (login && username && password) {
      login(username, password);
    }
  };

  return (
    <div className="has-text-centered">
      {oauth2Login && (
        <>
          <a className="button is-link is-fullwidth" href={`${oauth2Login}?from=${encodeURIComponent(from)}`}>
            {t("scm-oauth2-plugin.login", { provider: providerName })}
          </a>
          <hr />
        </>
      )}
      <form onSubmit={handleSubmit}>
        <ErrorNotification error={error} />
        <Field>
          <Input
            testId="username-input"
            placeholder={t("scm-oauth2-plugin.loginForm.username")}
            aria-label={t("scm-oauth2-plugin.loginForm.username")}
            autoFocus={true}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field>
          <Input
            testId="password-input"
            placeholder={t("scm-oauth2-plugin.loginForm.password")}
            aria-label={t("scm-oauth2-plugin.loginForm.password")}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
          />
        </Field>
        <Button
          type="submit"
          variant="primary"
          className="is-fullwidth"
          isLoading={isPending}
          disabled={isPending || !login || !username || !password}
        >
          {t("scm-oauth2-plugin.loginForm.submit")}
        </Button>
      </form>
    </div>
  );
};

export default OAuth2LoginForm;
