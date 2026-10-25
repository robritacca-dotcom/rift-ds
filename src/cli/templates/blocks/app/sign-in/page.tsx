'use client';

/**
 * The sign-in block: a centred card with email and password, a remember-me
 * choice and a single sign-on route. It checks the fields in the browser
 * and goes no further; connect `signIn` to your auth provider.
 */

import { useState, type FormEvent } from 'react';
import { Button } from 'rift-ds/components/Button/Button';
import { Checkbox } from 'rift-ds/components/Checkbox/Checkbox';
import { Divider } from 'rift-ds/components/Divider/Divider';
import { Input } from 'rift-ds/components/Input/Input';
import styles from './page.module.css';

const PRODUCT_NAME = 'Acme';
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const signIn = () => {
    const nextEmailError = EMAIL_SHAPE.test(email.trim()) ? undefined : 'Enter the email you signed up with.';
    const nextPasswordError = password ? undefined : 'Enter your password.';
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;
    // Hand { email, password, remember } to your auth provider here.
  };

  /* Button renders type="button", so the form submits through Enter in a
     field (onSubmit) and the button calls the same function on click. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signIn();
  };

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.intro}>
          <span className={styles.product}>{PRODUCT_NAME}</span>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subhead}>Welcome back. Sign in to pick up where you left off.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onValueChange={setEmail}
            error={Boolean(emailError)}
            helperText={emailError}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            error={Boolean(passwordError)}
            helperText={passwordError}
          />
          <div className={styles.row}>
            <Checkbox label="Remember me" checked={remember} onCheckedChange={setRemember} />
            <Button variant="tertiary" size="compact" label="Forgot password?" href="#" />
          </div>
          <Button variant="primary" label="Sign in" className={styles.full} onClick={signIn} />
        </form>

        <Divider label="or" labelPosition="center" spacing="none" />

        <Button
          variant="secondary"
          tone="neutral"
          label="Continue with single sign-on"
          iconLeft="key"
          className={styles.full}
        />

        <p className={styles.footer}>
          New here? <Button variant="tertiary" size="compact" label="Create an account" href="#" />
        </p>
      </main>
    </div>
  );
}
