"use client";

/**
 * The sign-in template: the front door for Tessera, a fictional shared
 * workspace, built from the design system alone. The screen is a two-pane
 * split running the full viewport — the form on the left, an ambient panel
 * on the right — and it is the family's first screen with no app shell
 * around it, because a sign-in page is what a product shows before the
 * shell exists.
 *
 * Composition calls, and the design.md rules behind them:
 *
 * - **The right pane is ShaderField**, the published renderer, full-bleed and
 *   at panel scale rather than the site's document-top band. Template screens
 *   rule 1 leaves out furniture with no sibling precedent, and an illustration
 *   would be exactly that — the system ships no imagery, and rule 4 rules out
 *   generated pictures of people. The field is the precedent the system
 *   already has for ambient scenery: it samples semantic colour tokens at
 *   runtime, so the pane re-themes with `data-theme` and with every preset
 *   with nothing wired up. It carries no overlaid copy: a pull quote or a
 *   marketing line would be invented furniture again. Under the pane's own
 *   breakpoint it drops out entirely and the form takes the screen, which is
 *   what a phone should get anyway.
 * - **The stage earns the viewport** (rule 3) reads differently here, because
 *   the stage is a 400px form. The split gives it half the screen and centres
 *   it; there is no KPI band, no drawn browser chrome, and no product tour
 *   beside the fields.
 * - **One job per control species** (rule 2): the three provider buttons are
 *   one species at one size — secondary Buttons, full width, stacked — and
 *   the email path below the rule is the same Button at primary. The rule
 *   itself is the library Divider's inline label, not a hand-drawn line.
 * - The provider marks are inline `currentColor` SVG (see BrandMarks.tsx):
 *   Material Symbols has no brand glyphs, and the library's icon props take a
 *   ReactNode for this case.
 * - The switchers ride the form pane's floor rather than a sidebar's, since
 *   this screen has no sidebar; it is the same shared SidebarSwitchers row
 *   every other template carries, so the presets stay reachable here too.
 *
 * Submitting is live in all four paths: the email form validates in place
 * through Input's own error state, and a provider button or a valid
 * submission swaps the pane for the post-sign-in confirmation, which returns.
 * No timers, so the mock cannot drift from what it renders. All data is
 * fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). This template carries no
 * docked TemplateAssistant: a product has no assistant to offer someone who
 * has not signed in yet.
 */

import React from "react";
import Image from "next/image";
import { Button } from "@robr0/design-system/components/Button/Button";
import { Checkbox } from "@robr0/design-system/components/Checkbox/Checkbox";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import { Input } from "@robr0/design-system/components/Input/Input";
import {
  ShaderField,
  type ShaderBlob,
  type ShaderParams,
} from "@robr0/design-system/components/ShaderField/ShaderField";
import SidebarSwitchers from "../SidebarSwitchers/SidebarSwitchers";
import { AppleMark, FacebookMark, GoogleMark } from "./BrandMarks";
import styles from "./SignIn.module.css";

/** The identity providers, in the order the buttons stack. */
const PROVIDERS = [
  { id: "google", label: "Google", Mark: GoogleMark },
  { id: "apple", label: "Apple", Mark: AppleMark },
  { id: "facebook", label: "Facebook", Mark: FacebookMark },
] as const;

/**
 * The pane's own field tuning. The shipped defaults are composed for the
 * site's background — a wide, shallow band behind text — so at half-viewport
 * width and full height they spread thin and pale. Two parameters carry the
 * difference: `intensity` goes to the top of its range because this field is
 * the subject rather than something read through, and `crop` to 1 so the
 * narrow pane crops into the composition at its own scale instead of fitting
 * the whole thing into the width. The drift is slowed, because scenery beside
 * a form should not pull the eye off the form.
 */
const FIELD_PARAMS: Partial<ShaderParams> = {
  intensity: 1,
  crop: 1,
  warp: 0.26,
  scale: 2.2,
  speed: 1.1,
  streak: 0.5,
  grain: 0.11,
};

/**
 * The sources, on the same core accent tokens the shipped composition uses —
 * so the pane re-themes with every preset — but laid out down the pane rather
 * than across a band. `--color-action-primary-bg` stays out for the reason
 * the library's own defaults leave it out: a decorative field is exactly the
 * use that would stop the action colour meaning "click here", and here it
 * would be sitting beside the button that does.
 */
const FIELD_BLOBS: readonly ShaderBlob[] = [
  { token: "--color-core-accent-violet", size: 0.95, cx: -0.14, cy: -0.5, period: 22, phase: 0.5, weight: 1 },
  { token: "--color-core-accent-cobalt", size: 0.85, cx: 0.3, cy: -0.28, period: 17, phase: 0.8, weight: 1 },
  { token: "--color-core-accent-mint", size: 0.7, cx: -0.32, cy: -0.04, period: 16, phase: 1, weight: 1 },
  { token: "--color-core-accent-coral", size: 0.8, cx: 0.26, cy: 0.14, period: 19, phase: 0.3, weight: 1 },
  { token: "--color-core-accent-gold", size: 0.62, cx: -0.06, cy: 0.36, period: 18, phase: 0, weight: 1 },
  { token: "--color-core-accent-amber", size: 0.55, cx: 0.33, cy: 0.5, period: 15, phase: 1.2, weight: 1 },
  { token: "--color-bg-container-secondary", size: 0.68, cx: -0.34, cy: 0.56, period: 14, phase: 1.5, weight: 1 },
  { token: "--color-core-ui-secondary", size: 0.8, cx: 0.04, cy: -0.02, period: 20, phase: 0.7, weight: 1 },
];

/** Good enough for a mock: something, an @, something, a dot, something. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  /**
   * Which door the visitor came through, or null while the form is up. The
   * two doors need two different sentences — a provider signs you in *with*
   * something, an email form signs you in *as* someone — so the kind travels
   * with the value rather than being guessed from it.
   */
  const [signedIn, setSignedIn] = React.useState<
    { kind: "provider" | "email"; value: string } | null
  >(null);

  /* The library's Button is always type="button" (its props Omit `type`), so
     a form cannot submit through it. The form keeps its onSubmit so Enter in
     a field still works, and the Button calls the same attempt on click. */
  const attemptSignIn = () => {
    const nextEmailError = EMAIL_SHAPE.test(email.trim())
      ? null
      : "Enter the email address you signed up with.";
    const nextPasswordError = password ? null : "Enter your password.";

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (!nextEmailError && !nextPasswordError) {
      setSignedIn({ kind: "email", value: email.trim() });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    attemptSignIn();
  };

  const handleReset = () => {
    setSignedIn(null);
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <div className={styles.shell}>
      <div className={styles.formPane}>
        <header className={styles.brand}>
          <Image src="/logos/mark.svg" alt="" width={28} height={28} priority />
          <span className={styles.wordmark}>Tessera</span>
        </header>

        <div className={styles.formWell}>
          {signedIn ? (
            <section className={styles.confirmation} aria-live="polite">
              <span
                className={`material-symbols-rounded ${styles.confirmationIcon}`}
                aria-hidden="true"
              >
                check_circle
              </span>
              <h1 className={styles.confirmationTitle}>You&rsquo;re in</h1>
              <p className={styles.subhead}>
                {signedIn.kind === "email"
                  ? `Signed in as ${signedIn.value}.`
                  : `Signed in with ${signedIn.value}.`}{" "}
                Your workspaces are loading.
              </p>
              <Button
                variant="tertiary"
                className={styles.backButton}
                label="Back to sign in"
                iconLeft="arrow_back"
                onClick={handleReset}
              />
            </section>
          ) : (
            <section className={styles.panel}>
              <div className={styles.intro}>
                <h1 className={styles.title}>Sign in to Tessera</h1>
                <p className={styles.subhead}>
                  Pick up where your team left off. Use a provider you already
                  have, or your Tessera email.
                </p>
              </div>

              <div className={styles.providers}>
                {PROVIDERS.map(({ id, label, Mark }) => (
                  <Button
                    key={id}
                    variant="secondary"
                    className={styles.providerButton}
                    iconLeft={<Mark className={styles.providerMark} />}
                    label={`Continue with ${label}`}
                    onClick={() =>
                      setSignedIn({ kind: "provider", value: `your ${label} account` })
                    }
                  />
                ))}
              </div>

              <Divider label="or" labelPosition="center" spacing="md" />

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  iconLeft="mail"
                  value={email}
                  onValueChange={setEmail}
                  error={Boolean(emailError)}
                  helperText={emailError ?? undefined}
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  iconLeft="lock"
                  value={password}
                  onValueChange={setPassword}
                  error={Boolean(passwordError)}
                  helperText={passwordError ?? undefined}
                />

                <div className={styles.formRow}>
                  <Checkbox
                    label="Keep me signed in"
                    size="compact"
                    checked={remember}
                    onCheckedChange={setRemember}
                  />
                  <Button
                    variant="tertiary"
                    size="compact"
                    label="Forgot password?"
                    href="#reset"
                  />
                </div>

                <Button variant="primary" label="Sign in" onClick={attemptSignIn} />
              </form>

              <p className={styles.signup}>
                New to Tessera? <a href="#create">Create an account</a>
              </p>
            </section>
          )}
        </div>

        <footer className={styles.paneFooter}>
          <p className={styles.legal}>
            Tessera is a fictional product, built from the design system alone.
          </p>
          <SidebarSwitchers />
        </footer>
      </div>

      <aside className={styles.artPane} aria-hidden="true">
        <ShaderField
          className={styles.field}
          params={FIELD_PARAMS}
          blobs={FIELD_BLOBS}
        />
      </aside>
    </div>
  );
}
